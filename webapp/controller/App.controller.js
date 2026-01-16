sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/ui/core/Fragment",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/library",
	"sap/tnt/library"
], function (
	Device,
	Controller,
	JSONModel,
	Popover,
	Fragment,
	Button,
	Dialog,
	MessageToast,
	Text,
	library,
	tntLibrary) {
	"use strict";

	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType,
		NavigationListItemDesign = tntLibrary.NavigationListItemDesign;

	return Controller.extend("claima.controller.App", {
		onInit: function () {
		},

		onCollapseExpandPress: function () {
			var oModel = this.getView().getModel();
			var oNavigationList = this.byId("navigationList");
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var oKey = oItem.getKey();

			// Start added by Jefry 15-01-2026
			switch (oKey) {
				case "createreport": this.onClickExpenseReport(); break;
				case "createrequest": this.onClickMyRequest(); break;
				default: this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			}
			// End added by Jefry 15-01-2026
		
			// if (oKey == "createreport" || oKey == "myrequest") {
			// 	this.onClickExpenseReport();
			// } else {
			// 	this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			// }
		},
		onClickExpenseReport: async function () {
			if (!this.oDialogFragment) {
				this.oDialogFragment = await Fragment.load({
					id: "expense",
					name: "claima.fragment.expense",
					type: "XML",
					controller: this,
				});
				this.getView().addDependent(this.oDialogFragment);		
				
				// Start added by Jefry Yap
				this.oDialogFragment.attachAfterClose(() =>{
					this.oDialogFragment.destroy();
					this.oDialogFragment = null;
				});
				// End added by Jefry Yap
			}
			this.oDialogFragment.open();
		},
		onItemPress: function (oEvent) {
			const oItem = oEvent.getParameter("item"),
				sText = oItem.getText();
		},

		onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		},

		onClickCancel: function () {
			this.oDialogFragment.close();
		},

		// Start added by Jefry Yap 15-01-2026
		onClickMyRequest: async function () {
			if (!this.oDialogFragment) {
				this.oDialogFragment = await Fragment.load({
					id: "request",
					name: "claima.fragment.request",
					type: "XML",
					controller: this,
				});
				this.getView().addDependent(this.oDialogFragment);	
				
				this.oDialogFragment.attachAfterClose(() =>{
					this.oDialogFragment.destroy();
					this.oDialogFragment = null;
				});
			}
			this.oDialogFragment.open();
			this.oDialogFragment.addStyleClass('requestDialog')
		},

		onClickCreateRequest: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			this.oDialogFragment.close();
			this.byId("pageContainer").to(this.getView().byId('new_request'));
		}
		// End added by Jefry Yap 15-01-2026

	});
});