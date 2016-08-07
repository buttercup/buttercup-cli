const menu = require("../tools/menu.js");

const AUTH_METHODS = [
    { title: "Password only",                   value: "password" },
    { title: "Key-file only",                   value: "keyfile" },
    { title: "Password and Key-file",           value: "password,keyfile" }
];

module.exports = {

    getRequiredAuthenticationInfo: function(authMethods) {
        return Promise.resolve({})
            .then(function(info) {
                if (authMethods.indexOf("password") >= 0) {
                    return menu
                        .presentPasswordPrompt()
                        .then(function(pass) {
                            info.password = pass;
                            return info;
                        });
                }
                return info;
            })
            .then(function(info) {
                if (authMethods.indexOf("keyfile") >= 0) {
                    // @todo handle this
                }
                return info;
            });
    },

    selectAuthMethods: function() {
        return menu
            .presentSelectMenu("Authentication method(s)", AUTH_METHODS)
            .then((methods) => methods.split(","));
    }

};
