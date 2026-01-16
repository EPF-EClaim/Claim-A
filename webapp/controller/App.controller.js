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
		
			if (oKey == "createreport" || oKey == "myrequest") {
				this.onClickExpenseReport();
			} else {
				this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			}
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

		onClickCreateReport: function () {
			var view = "createreport";
			this.oDialogFragment.close();
			this.byId("pageContainer").to(this.getView().createId(view));
		},

		onPressBack: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("dashboard"));
		}, 

	});
});