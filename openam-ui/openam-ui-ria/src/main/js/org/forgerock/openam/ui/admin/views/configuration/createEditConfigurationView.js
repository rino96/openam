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

 /**
  * @module org/forgerock/openam/ui/admin/views/configuration/createEditConfigurationView
  */
define("org/forgerock/openam/ui/admin/views/configuration/createEditConfigurationView", [
    "jquery",
    "lodash",
    "org/forgerock/commons/ui/common/components/Messages",
    "org/forgerock/commons/ui/common/main/AbstractView",
    "org/forgerock/commons/ui/common/main/EventManager",
    "org/forgerock/commons/ui/common/main/Router",
    "org/forgerock/commons/ui/common/util/Constants",
    "org/forgerock/openam/ui/admin/models/Form",
    "org/forgerock/openam/ui/admin/services/SMSGlobalService",
    "org/forgerock/openam/ui/admin/views/common/Backlink",

    // jquery dependencies
    "bootstrap-tabdrop"
], ($, _, Messages, AbstractView, EventManager, Router, Constants, Form, SMSGlobalService, Backlink) => {

    /**
     * Returns a edit configuration view
     * @param   {function} get a function that returns object
     * @param   {function} update a function that returns updates object
     * @returns {function} createEditConfigurationView a function that creates a view
     */
    const createEditConfigurationView = (get, update) => (
        AbstractView.extend({
            template: "templates/admin/views/configuration/EditConfigurationTemplate.html",
            events: {
                "click [data-save]": "onSave",
                "show.bs.tab ul.nav.nav-tabs a": "renderTab"
            },

            render (args) {
                this.data.id = args[0];
                get(this.data.id).then((data) => {
                    this.data.schema = data.schema;
                    this.data.values = data.values;
                    this.data.name = data.values._type.name;
                    this.data.tabbed = this.data.schema.grouped;

                    this.parentRender(() => {
                        if (this.data.tabbed) {
                            this.$el.find("ul.nav a:first").tab("show");
                            this.$el.find(".tab-menu .nav-tabs").tabdrop();
                        } else {
                            this.form = new Form(
                                this.$el.find("#tabpanel")[0],
                                this.data.schema,
                                this.data.values
                            );
                        }
                        new Backlink().render();
                    });
                });
            },

            onSave () {
                update(this.data.id, this.form.data())
                    .then((data) => {
                        EventManager.sendEvent(Constants.EVENT_DISPLAY_MESSAGE_REQUEST, "changesSaved");
                        this.data.values = data;
                    }, (response) => {
                        Messages.addMessage({ response, type: Messages.TYPE_DANGER });
                    });
            },

            renderTab (event) {
                const tabId = $(event.target).data("tabId");
                const schema = this.data.schema.grouped ? this.data.schema.properties[tabId] : this.data.schema;
                const element = this.$el.find("#tabpanel").empty().get(0);
                this.form = new Form(element, schema, this.data.values[tabId]);
                this.$el.find("[data-header]").parent().hide();
            }
        })
    );

    return createEditConfigurationView;
});
