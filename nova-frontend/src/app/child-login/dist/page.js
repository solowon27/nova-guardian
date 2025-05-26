'use client';
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_1 = require("@apollo/client");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var LOGIN_CHILD = client_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  mutation LoginChild($username: String!, $password: String!) {\n    loginChild(username: $username, password: $password) {\n      token\n      child {\n        id\n        name\n        age\n      }\n    }\n  }\n"], ["\n  mutation LoginChild($username: String!, $password: String!) {\n    loginChild(username: $username, password: $password) {\n      token\n      child {\n        id\n        name\n        age\n      }\n    }\n  }\n"])));
function ChildLoginPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = react_1.useState({ username: '', password: '' }), form = _a[0], setForm = _a[1];
    var _b = client_1.useMutation(LOGIN_CHILD), loginChild = _b[0], _c = _b[1], loading = _c.loading, error = _c.error;
    var handleChange = function (e) {
        var _a;
        return setForm(__assign(__assign({}, form), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var data, _a, id, age;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    return [4 /*yield*/, loginChild({ variables: form })];
                case 1:
                    data = (_c.sent()).data;
                    if ((_b = data === null || data === void 0 ? void 0 : data.loginChild) === null || _b === void 0 ? void 0 : _b.token) {
                        localStorage.setItem('token', data.loginChild.token);
                        _a = data.loginChild.child, id = _a.id, age = _a.age;
                        if (age >= 3 && age <= 6)
                            router.push("/child/" + id + "/young");
                        else if (age >= 7 && age <= 10)
                            router.push("/child/" + id + "/mid");
                        else
                            router.push("/child/" + id + "/teen");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center px-4" },
        React.createElement("div", { className: "bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center" },
            React.createElement("h2", { className: "text-3xl font-bold mb-4 text-purple-700" }, "Child Login"),
            React.createElement("p", { className: "text-sm text-gray-600 mb-6" }, "Enter your username and password to access your dashboard."),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement("input", { name: "username", type: "text", placeholder: "Username", value: form.username, onChange: handleChange, className: "w-full mb-3 px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400", required: true }),
                React.createElement("input", { name: "password", type: "password", placeholder: "Password", value: form.password, onChange: handleChange, className: "w-full mb-4 px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400", required: true }),
                React.createElement("button", { type: "submit", disabled: loading, className: "w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition duration-300" }, loading ? 'Logging in...' : 'Login'),
                error && React.createElement("p", { className: "text-red-500 text-sm mt-2" }, error.message)))));
}
exports["default"] = ChildLoginPage;
var templateObject_1;
