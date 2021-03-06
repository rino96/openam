/*
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2016 ForgeRock AS.
 */
define("org/forgerock/openam/ui/admin/views/realms/authentication/modules/AddModuleView", [
    "jquery",
    "lodash",
    "org/forgerock/commons/ui/common/main/AbstractView",
    "org/forgerock/commons/ui/common/main/Router",
    "org/forgerock/commons/ui/common/components/Messages",
    "org/forgerock/openam/ui/admin/services/SMSRealmService",

    // jquery dependencies
    "selectize"
], function ($, _, AbstractView, Router, Messages, SMSRealmService) {

    function validateModuleProps () {
        var moduleName = this.$el.find("#newModuleName").val(),
            moduleType = this.$el.find("#newModuleType")[0].selectize.getValue(),
            isValid;

        if (moduleName.indexOf(" ") !== -1) {
            moduleName = false;
            Messages.addMessage({
                type: Messages.TYPE_DANGER,
                message: $.t("console.authentication.modules.moduleNameValidationError")
            });
        }
        isValid = moduleName && moduleType;
        this.$el.find("[data-save]").attr("disabled", !isValid);
    }


    return AbstractView.extend({
        template: "templates/admin/views/realms/authentication/modules/AddModuleTemplate.html",
        events: {
            "change [data-module-name]": "onValidateModuleProps",
            "keyup  [data-module-name]": "onValidateModuleProps",
            "change [data-module-type]": "onValidateModuleProps",
            "click [data-save]"        : "save"
        },
        render: function (args, callback) {
            var self = this;
            this.data.realmPath = args[0];

            SMSRealmService.authentication.modules.types.all(this.data.realmPath).then(function (modulesData) {
                self.data.types = modulesData.result;
                self.parentRender(function () {
                    self.$el.find("#newModuleType").selectize();
                    self.$el.find("[autofocus]").focus();
                    if (callback) {
                        callback();
                    }
                });
            });
        },
        save: function () {
            var self = this,
                moduleName = self.$el.find("#newModuleName").val(),
                moduleType = self.$el.find("#newModuleType").val(),
                modulesService = SMSRealmService.authentication.modules;

            modulesService.exists(self.data.realmPath, moduleName).then(function (result) {
                var authenticationModules = modulesService;
                if (result) {
                    Messages.addMessage({
                        type: Messages.TYPE_DANGER,
                        message: $.t("console.authentication.modules.addModuleError")
                    });
                } else {
                    authenticationModules.create(self.data.realmPath, { _id: moduleName }, moduleType)
                    .then(function () {
                        Router.routeTo(Router.configuration.routes.realmsAuthenticationModuleEdit, {
                            args: _.map([self.data.realmPath, moduleType, moduleName], encodeURIComponent),
                            trigger: true
                        });
                    }, function (response) {
                        Messages.addMessage({
                            type: Messages.TYPE_DANGER,
                            response: response
                        });
                    });
                }
            }, function (response) {
                Messages.addMessage({
                    type: Messages.TYPE_DANGER,
                    response: response
                });
            });
        },
        onValidateModuleProps: function () {
            validateModuleProps.call(this);
        }
    });
});
