#include <iostream>

using namespace std;

int idx;
string expr;

double do_multiply();
double do_term();

double do_add() {
    double res = do_multiply();
    while (idx < expr.size() && (expr[idx] == '+' || expr[idx] == '-')) {
        if (expr[idx] == '+') {
            idx++;
            res += do_multiply();
        }
        else {
            idx++;
            res -= do_multiply();
        }
    }

    return res;
}

double do_multiply() {
    double res = do_term();
    while (idx < expr.size() && (expr[idx] == '*' || expr[idx] == '/')) {
        if (expr[idx] == '*') {
            idx++;
            res *= do_term();
        }
        else {
            idx++;
            res /= do_term();
        }
    }
    return res;
}

double do_term() {
    double res = 0;
    if (expr[idx] == '(') {
        idx++;
        res = do_add();
        idx++;
    }
    else {
        while (idx < expr.size() && expr[idx] >= '0' && expr[idx] <= '9') {
            res = res * 10 + (expr[idx] - '0');
            idx++;
        }
    }
    return res;
}

int main()
{
    cin >> expr;
    cout << do_add() << "\n";
    return 0;
}