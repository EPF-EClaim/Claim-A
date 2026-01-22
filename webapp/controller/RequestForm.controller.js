sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label"

], (Controller, MessageToast, JSONModel, Dialog, Button, Label, UIComponent, Device) => {
    "use strict";

    return Controller.extend("claima.controller.RequestForm", {
        onInit() {
            
            const oViewModel = new JSONModel({
                    currentPageId: "req_item_table_view" // matches your initialPage
                });
            this.getView().setModel(oViewModel, "view");

            // Keep model in sync when user navigates
            const oNav = this.byId("req_form_item_container");
            oNav.attachAfterNavigate(this._onAfterNavigate, this);

        }, 

        _onAfterNavigate: function (oEvent) {
            const oTo = oEvent.getParameter("to");
            const test = this.getView().getLocalId(oTo.getId());
            if (oTo) {
                this.getView().getModel("view").setProperty("/currentPageId", this.getView().getLocalId(oTo.getId()));
            }
        }, 
 
        onBack: function () {
			if (!this.oBackDialog) {
				this.oBackDialog = new Dialog({
					title: "Warning",
					type: "Message",
					content: [
						new Label({
							text: "You haven't save, do you confirm to go back?",
							labelFor: "rejectionNote"
						})
					],
					beginButton: new Button({
						type: "Emphasized",
						text: "Confirm",
						press: function () {
							this.oBackDialog.close();
                            // nav to dashboard
							var oScroll = this.getView().getParent();          // ScrollContainer
							var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

							var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
							var oMainPage = aPages && aPages.find(function (p) {
								return p.getId && p.getId().endsWith("dashboard");
							});

							if (oMainPage) {
							oMaybeNav.to(oMainPage, "slide");
							}


						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oBackDialog.close();
						}.bind(this)
					})
				});
			}

			this.oBackDialog.open();
        }, 

		onSaveRequestDraft: function () {
			MessageToast.show("save draft")	
		},

        onDeleteRequest: function () {
			if (!this.oDeleteDialog) {
				this.oDeleteDialog = new Dialog({
					title: "Delete Request",
					type: "Message",
					content: [
						new Label({
							text: "Do you want to delete this request?",
							labelFor: "rejectionNote"
						})
					],
					beginButton: new Button({
						type: "Emphasized",
						text: "Delete",
						press: function () {
							this.oDeleteDialog.close();
                            // nav to dashboard
							var oScroll = this.getView().getParent();          // ScrollContainer
							var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

							var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
							var oMainPage = aPages && aPages.find(function (p) {
								return p.getId && p.getId().endsWith("dashboard");
							});

							if (oMainPage) {
							oMaybeNav.to(oMainPage, "slide");
							}


						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oDeleteDialog.close();
						}.bind(this)
					})
				});
			}

			this.oDeleteDialog.open();
		},

		onSubmitRequest: function () {
			MessageToast.show("submit request")	
		},

		onCancelItem: function () {
			MessageToast.show("cancel item")	
		},
		
		onSaveItem: function () {
			MessageToast.show("save item")	
		},
    });

});