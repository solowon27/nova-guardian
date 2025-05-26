"use strict";
exports.__esModule = true;
// app/layout.tsx
require("./globals.css");
var ApolloWrapper_1 = require("@/components/ApolloWrapper");
var Header_1 = require("@/components/Header");
var Footer_1 = require("@/components/Footer");
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en" },
        React.createElement("body", { className: "flex flex-col min-h-screen" },
            React.createElement(ApolloWrapper_1["default"], null,
                React.createElement(Header_1["default"], null),
                React.createElement("main", { className: "flex-grow" }, children),
                React.createElement(Footer_1["default"], null)))));
}
exports["default"] = RootLayout;
