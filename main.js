var levels;

var curr_level_idx;
var sok_rows, sok_columns;
var sokoban_grid;
var is_storage_loc;
var player_x, player_y;

var images = {};

class Sokoban_Level {
    constructor() {
        this.rows = 0;
        this.columns = 0;

        this.start_x = 0;
        this.start_y = 0;

        this.grid = Array(0);
        this.is_storage_loc = Array(0);
    }
}

class Tile_Type {
    static get EMPTY () {return 0;}
    static get WALL() {return 1;}
    static get BOX() {return 2;}
}

class Move {
    static get UP() {return 0;}
    static get LEFT() {return 1;}
    static get DOWN() {return 2;}
    static get RIGHT() {return 3;}

    dir = 0;
    pused_box = false;

    constructor(dir_, pushed_box_) {
        this.dir = dir_;
        this.pused_box = pushed_box_;
    }
}

var num_pushes = 0;
var move_stack = Array(0);

function is_inside_grid(y, x) {
    if (x < 0 || y < 0 || x >= sok_columns || y >= sok_rows)
        return false;
    return true;
}

function is_empty_tile(y, x) {
    if (!is_inside_grid(y,x))
        return false;
    if (sokoban_grid[y][x] != Tile_Type.EMPTY)
        return false;
    return true;
}

function is_box_tile(y, x) {
    if (!is_inside_grid(y,x))
        return false;
    if (sokoban_grid[y][x] != Tile_Type.BOX)
        return false;
    return true;
}

function try_move_up() {
    if (!(sokoban_grid[player_y -1][player_x] == Tile_Type.EMPTY)) {
        if (!is_box_tile(player_y-1, player_x))
            return;
        if (!is_empty_tile(player_y-2, player_x))
            return;
    }

    player_y -= 1

    if (is_box_tile(player_y, player_x)) {
        sokoban_grid[player_y][player_x] = Tile_Type.EMPTY;
        sokoban_grid[player_y-1][player_x] = Tile_Type.BOX;

        move_stack.push(new Move(Move.UP, true));
        num_pushes++;
    } else
        move_stack.push(new Move(Move.UP, false));

    draw_sokoban();
}

function try_move_down() {
    if (!(sokoban_grid[player_y +1][player_x] == Tile_Type.EMPTY)) {
        if (!is_box_tile(player_y+1, player_x))
            return;
        if (!is_empty_tile(player_y+2, player_x))
            return;
    }

    player_y += 1

    if (is_box_tile(player_y, player_x)) {
        sokoban_grid[player_y][player_x] = Tile_Type.EMPTY;
        sokoban_grid[player_y+1][player_x] = Tile_Type.BOX;

        move_stack.push(new Move(Move.DOWN, true));
        num_pushes++;
    } else
        move_stack.push(new Move(Move.DOWN, false));

    draw_sokoban();
}

function try_move_right() {
    if (!(sokoban_grid[player_y][player_x+1] == Tile_Type.EMPTY)) {
        if (!is_box_tile(player_y, player_x+1))
            return;
        if (!is_empty_tile(player_y, player_x+2))
            return;
    }

    player_x += 1

    if (is_box_tile(player_y, player_x)) {
        sokoban_grid[player_y][player_x] = Tile_Type.EMPTY;
        sokoban_grid[player_y][player_x+1] = Tile_Type.BOX;

        move_stack.push(new Move(Move.RIGHT, true));
        num_pushes++;
    } else
        move_stack.push(new Move(Move.RIGHT, false));

    draw_sokoban();
}

function try_move_left() {
    if (!(sokoban_grid[player_y][player_x-1] == Tile_Type.EMPTY)) {
        if (!is_box_tile(player_y, player_x-1))
            return;
        if (!is_empty_tile(player_y, player_x-2))
            return;
    }

    player_x -= 1

    if (is_box_tile(player_y, player_x)) {
        sokoban_grid[player_y][player_x] = Tile_Type.EMPTY;
        sokoban_grid[player_y][player_x-1] = Tile_Type.BOX;

        move_stack.push(new Move(Move.LEFT, true));
        num_pushes++;
    } else
        move_stack.push(new Move(Move.LEFT, false));

    draw_sokoban();
}

function undo_move() {
    if (move_stack.length == 0)
        return;

    console.log(move_stack);
    if (move_stack.at(-1).dir == Move.UP) {
        if (move_stack.at(-1).pused_box == true) {
            sokoban_grid[player_y][player_x] = Tile_Type.BOX;
            sokoban_grid[player_y-1][player_x] = Tile_Type.EMPTY;
        }

        player_y += 1;
    } else if (move_stack.at(-1).dir == Move.LEFT) {
        if (move_stack.at(-1).pused_box == true) {
            sokoban_grid[player_y][player_x] = Tile_Type.BOX;
            sokoban_grid[player_y][player_x-1] = Tile_Type.EMPTY;
        }

        player_x += 1;
    } else if (move_stack.at(-1).dir == Move.DOWN) {
        if (move_stack.at(-1).pused_box == true) {
            sokoban_grid[player_y][player_x] = Tile_Type.BOX;
            sokoban_grid[player_y+1][player_x] = Tile_Type.EMPTY;
        }

        player_y -= 1;
    } else if (move_stack.at(-1).dir == Move.RIGHT) {
        if (move_stack.at(-1).pused_box == true) {
            sokoban_grid[player_y][player_x] = Tile_Type.BOX;
            sokoban_grid[player_y][player_x+1] = Tile_Type.EMPTY;
        }

        player_x -= 1;
    }

    if (move_stack.at(-1).pused_box == true) {
        num_pushes--;
    }

    move_stack.pop();
    draw_sokoban();
}

function reset() {
    load_level(curr_level_idx);
    draw_sokoban();
}

function draw_sokoban() {
    let canvas = document.getElementById("canvas");

    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let y = 0, x = 0, tile_size = Math.min(canvas.width / sok_columns, canvas.height / sok_rows);
        
        y = (canvas.height - (tile_size * sok_rows))/2;

        for (let row = 0; row < sok_rows; row++) {
            for (let col = 0; col < sok_columns; col++) {
                switch(sokoban_grid[row][col]) {
                    case Tile_Type.EMPTY: {
                        if (is_storage_loc[row][col]) {
                            ctx.beginPath();
                            ctx.arc(x + tile_size/2, y + tile_size/2, tile_size/4, 0, Math.PI * 2, false);
                            ctx.fillStyle = "rgb(255, 100, 120)"; 
                            ctx.fill(); 
                            ctx.stroke();
                        }

                        if (row == player_y && col == player_x) {
                            ctx.drawImage(images[3], x, y, tile_size, tile_size);
                        }
                    } break;
                    case Tile_Type.BOX: {
                        if (is_storage_loc[row][col]) {
                            ctx.drawImage(images[1], x, y, tile_size, tile_size);
                        } else {
                            ctx.drawImage(images[0], x, y, tile_size, tile_size);
                        }
                    } break;
                    case Tile_Type.WALL: {
                        ctx.drawImage(images[2], x, y, tile_size, tile_size);
                    } break;
                }

                x += tile_size;
            }

            y += tile_size;
            x = 0;
        }
    }

    let moves_label = document.getElementById("num-moves");
    moves_label.innerHTML = "Moves: " + move_stack.length;
    let pushes_label = document.getElementById("num-pushes");
    pushes_label.innerHTML = "Pushes: " + num_pushes;
}

function load_level(lvl_idx) {
    console.assert(lvl_idx >= 0 && lvl_idx < levels.length);

    curr_level_idx = lvl_idx;
    sok_rows = levels[lvl_idx].rows;
    sok_columns = levels[lvl_idx].columns;

    player_x = levels[lvl_idx].start_x;
    player_y = levels[lvl_idx].start_y;

    sokoban_grid = Array(sok_rows);
    is_storage_loc = Array(sok_rows);
    for (let i = 0; i < sok_rows; i++) {
        sokoban_grid[i] = Array.from(levels[lvl_idx].grid[i]);
        is_storage_loc[i] = Array.from(levels[lvl_idx].is_storage_loc[i]);
    }

    move_stack = Array(0);
    num_pushes = 0;
}

function parse_levels() {
    let xml_content = "";
    fetch("sok_levels.xml").then((response)=> {
        response.text().then((xml)=>{
            xml_content = xml;
            
            let parser = new DOMParser();
            let xml_DOM = parser.parseFromString(xml_content, "application/xml");
            
            let xml_levels = xml_DOM.querySelectorAll("Level");
            levels = new Array(xml_levels.length);

            for (let lvl = 0; lvl < xml_levels.length; lvl++) {
                levels[lvl] = new Sokoban_Level();
                levels[lvl].rows = Number( xml_levels[lvl].getAttribute("Height") );
                levels[lvl].columns = Number( xml_levels[lvl].getAttribute("Width") );
                levels[lvl].grid = Array(levels[lvl].rows);
                levels[lvl].is_storage_loc = Array(levels[lvl].rows);

                let xml_rows = xml_levels[lvl].querySelectorAll("L");

                for (let r = 0; r < xml_rows.length; r++) {
                    levels[lvl].grid[r] = Array(levels[lvl].columns);
                    levels[lvl].is_storage_loc[r] = Array(levels[lvl].columns);

                    levels[lvl].grid[r].fill(0);
                    levels[lvl].is_storage_loc[r].fill(0);

                    let xml_row = xml_rows[r].innerHTML;

                    for (let c = 0; c < xml_row.length; c++) {
                        
                        switch(xml_row[c]) {
                            case '#': {
                                levels[lvl].grid[r][c] = Tile_Type.WALL;
                            } break;
                            case '.': {
                                levels[lvl].is_storage_loc[r][c] = true;
                            } break;
                            case '$': {
                                levels[lvl].grid[r][c] = Tile_Type.BOX;
                            } break;
                            case '*': {
                                levels[lvl].grid[r][c] = Tile_Type.BOX;
                                levels[lvl].is_storage_loc[r][c] = true;
                            } break;
                            case '@': {
                                levels[lvl].start_y = r;
                                levels[lvl].start_x = c;
                            } break;
                            case '+': {
                                levels[lvl].start_y = r;
                                levels[lvl].start_x = c;
                                levels[lvl].is_storage_loc[r][c] = true;
                            } break;
                        }

                    }
                }
            }
            
            console.log(levels);
            load_level(0);
            draw_sokoban();
        });
    });
}

function window_resize_event() {
    let canvas = document.getElementById("canvas");
    let canvas_width = window.innerWidth * 0.7;
    let canvas_height = window.innerHeight * 0.8;
    canvas.width = Math.min(canvas_width, canvas_height);
    canvas.height = Math.min(canvas_width, canvas_height);

    draw_sokoban();
}

function load_assets() {
    const image_sources = [
        'assets/box.PNG',
        'assets/box_goal.PNG',
        'assets/wall.PNG',
        'assets/player.ico'
      ];

    image_sources.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      images[index] = img; // Store the image with a key
    });
}

function main() {
    load_assets();
    parse_levels();

    document.querySelectorAll('.level-dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
          e.preventDefault(); 
          let selected_level = Number(this.getAttribute('data-level')); 
          document.getElementById('level-dropdown-menu').textContent = `Level: ${selected_level}`; 
          
          load_level(selected_level-1);
          draw_sokoban();
        });
      });

    window.addEventListener('resize', window_resize_event);

    document.addEventListener('keydown', function(event) {
        switch (event.key) {
          case 'w':
            try_move_up();
            break;
          case 'a':
            try_move_left();
            break;
          case 's':
            try_move_down();
            break;
          case 'd':
            try_move_right();
            break;
           case 'z':
            undo_move();
            break;
        }
    });

    window_resize_event();
}

main();