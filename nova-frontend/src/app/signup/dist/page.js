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
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var link_1 = require("next/link");
var SIGNUP = client_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  mutation RegisterParent($email: String!, $password: String!) {\n    registerParent(email: $email, password: $password) {\n      token\n      user {\n        email\n      }\n    }\n  }\n"], ["\n  mutation RegisterParent($email: String!, $password: String!) {\n    registerParent(email: $email, password: $password) {\n      token\n      user {\n        email\n      }\n    }\n  }\n"])));
function SignupPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = react_1.useState({ email: '', password: '' }), form = _a[0], setForm = _a[1];
    var _b = client_1.useMutation(SIGNUP), registerParent = _b[0], _c = _b[1], loading = _c.loading, error = _c.error;
    var handleChange = function (e) {
        var _a;
        return setForm(__assign(__assign({}, form), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    return [4 /*yield*/, registerParent({ variables: form })];
                case 1:
                    data = (_b.sent()).data;
                    if ((_a = data === null || data === void 0 ? void 0 : data.registerParent) === null || _a === void 0 ? void 0 : _a.token) {
                        localStorage.setItem('token', data.registerParent.token);
                        router.push('/parent');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-white to-purple-200 px-4" },
        React.createElement("div", { className: "bg-white shadow-lg rounded-xl w-full max-w-md p-6" },
            React.createElement("h2", { className: "text-2xl font-bold text-center mb-4" }, "\uD83D\uDC68\u200D\uD83D\uDC67 Create Parent Account"),
            React.createElement("p", { className: "text-sm text-gray-500 text-center mb-6" }, "Start guiding your child\u2019s personalized learning experience."),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement("input", { name: "email", type: "email", placeholder: "Email", value: form.email, onChange: handleChange, className: "w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-purple-400" }),
                React.createElement("input", { name: "password", type: "password", placeholder: "Password", value: form.password, onChange: handleChange, className: "w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-purple-400" }),
                React.createElement("button", { type: "submit", disabled: loading, className: "w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded" }, loading ? 'Creating...' : 'Create Account'),
                error && React.createElement("p", { className: "text-red-500 text-sm mt-2" }, error.message)),
            React.createElement("p", { className: "text-sm text-center mt-4" },
                "Already have an account?",
                ' ',
                React.createElement(link_1["default"], { href: "/login", className: "text-purple-600 hover:underline" }, "Log in")))));
}
exports["default"] = SignupPage;
var templateObject_1;
