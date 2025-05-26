'use client';
"use strict";
exports.__esModule = true;
var client_1 = require("@apollo/client");
var apollo_client_1 = require("@/graphql/apollo-client");
function ApolloWrapper(_a) {
    var children = _a.children;
    return React.createElement(client_1.ApolloProvider, { client: apollo_client_1["default"] }, children);
}
exports["default"] = ApolloWrapper;
