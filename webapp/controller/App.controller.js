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
			var oReportModel = new JSONModel({
				reportpurpose: "",
				startdate: "",
				enddate: "",
				prerequest: "",
				approvedamt: 0,
				comment: ""
			});
			this.getView().setModel(oReportModel, "report");

			// CONFIG MODEL for all 4 table
			var oConfigModel = new JSONModel({
				ZCLAIM_PURPOSE: [],
				ConfigurationTable2: [],
				ConfigurationTable3: [],
				ConfigurationTable4: [],
				active: {
					data: []
				}
			});
			this.getView().setModel(oConfigModel, "configModel");
		},

		// CLICK CONFIGURATION TABLE CARD
		onOpenConfigTable: async function (oEvent) {

			let tableId = oEvent.getSource().getCustomData()[0].getValue();
			let m = this.getView().getModel("configModel");

			m.setProperty("/active/title", tableId);
			m.setProperty("/active/data",
				JSON.parse(JSON.stringify(m.getProperty("/" + tableId)))
			);

			this.loadConfigPage();
		},
		// LOAD CONFIG DETAIL PAGE
		loadConfigPage: async function () {

			if (!this.oConfigDetailPage) {

				const oFragment = await Fragment.load({
					id: this.createId("ConfigFrag"),
					name: "claima.fragment.configuration",
					controller: this
				});
				this.getView().addDependent(oFragment);

				this.oConfigDetailPage = new sap.m.Page(
					this.createId("configDetailPage"),
					{
						title: "eClaim Configuration",
						content: [oFragment],
						showNavButton: true,
						navButtonPress: this.onBackFromConfigTable.bind(this)
					}
				);
				this.byId("pageContainer").addPage(this.oConfigDetailPage);
			}
			this.byId("pageContainer").to(this.byId("configDetailPage"));
		},

		// BACK BUTTON CONFIGURATION
		onBackFromConfigTable: function () {
			this.byId("pageContainer").to(this.byId("configuration"));
		},

		// SAVE CONFIGURATION
		onSaveConfigTable: function () {
			let m = this.getView().getModel("configModel");
			let tableId = m.getProperty("/active/title");
			let activeData = m.getProperty("/active/data");

			activeData.forEach(r => r.edit = false);
			m.setProperty("/" + tableId, activeData);

			MessageToast.show("Saved");
		},

		// ADD NEW ROW CONFIGURATION
		onAddEntry: function () {
			let data = this.getView().getModel("configModel").getProperty("/active/data");

			data.push({
				Claim_Purpose_ID: "",
				Claim_Purpose_Desc: "",

				edit: true,
				selected: false
			});
			let m = this.getView().getModel("configModel");
			m.refresh(true);

		},

		// EDIT ROW CONFIGURATION
		onEditEntry: function () {
			let oTable = this.byId("ConfigFrag--configTable");
			let sel = oTable.getSelectedItems();
			if (!sel.length) return MessageToast.show("Select a row.");

			let ctx = sel[0].getBindingContext("configModel");
			ctx.setProperty("edit", true);
		},

		// COPY ROW CONFIGURATION
		onCopyEntry: function () {
			let oTable = this.byId("ConfigFrag--configTable");
			let sel = oTable.getSelectedItem();
			if (!sel) return MessageToast.show("Select a row.");

			let m = this.getView().getModel("configModel");
			let data = m.getProperty("/active/data");
			let obj = sel.getBindingContext("configModel").getObject();

			data.push({ ...obj, edit: true });
			m.refresh(true);
		},

		// DELETE ROW CONFIGURATION
		onDeleteEntry: function () {
			let oTable = this.byId("ConfigFrag--configTable");
			let sel = oTable.getSelectedItems();
			if (!sel.length) return MessageToast.show("Nothing selected.");

			let m = this.getView().getModel("configModel");
			let data = m.getProperty("/active/data");

			sel.reverse().forEach(item => {
				let index = item.getBindingContext("configModel").getPath().split("/").pop();
				data.splice(index, 1);
			});

			m.refresh(true);

		},
		onCollapseExpandPress: function () {
			var oModel = this.getView().getModel();
			var oNavigationList = this.byId("navigationList");
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

		onItemSelect: async function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var sKey = oItem.getKey();

			switch (sKey) {
				case "createreport":
				case "myrequest":
					this.onClickExpenseReport();
					break;
				case "report": // your configuration menu
					this.onClickConfiguration();
					break;
				default:
					// navigate to page with ID same as the key
					var oPage = this.byId(sKey); // make sure your NavContainer has a page with this ID
					if (oPage) {
						this.byId("pageContainer").to(oPage);
					}
					break;
			}

		},
		// Configuration
		onClickConfiguration: async function () {
			if (!this.oConfigPage) {
				this.oConfigPage = Fragment.load({
					name: "claima.fragment.configuration",
					type: "XML",
					controller: this
				});
				this.getView().addDependent(this.oConfigPage);
			}

			// Navigate to configuration page
			var oPageContainer = this.byId("pageContainer");
			if (!this.byId("configurationPage")) {
				var oPage = new sap.m.Page(this.createId("configurationPage"), {
				});
			}
			oPageContainer.to(this.byId("configurationPage"));

		},
		onClickExpenseReport: async function () {
			if (!this.oDialogFragment) {
				this.oDialogFragment = await Fragment.load({
					// id: 
					// this.getView().getId(), 
					//  "expense",

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
			var oData = this.getView().getModel("report").getData();

			var view = "createreport";
			this.oDialogFragment.close();
			this.byId("pageContainer").to(this.getView().createId(view));
			this.getView().byId("expensetypescr").setVisible(true);
			this.getView().byId("claimscr").setVisible(false);
			this.createreportButtons("expensetypescr");
		},

		onPressBack: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("dashboard"));
		},

		onPressClaimDetails: function () {
			this.getView().byId("expensetypescr").setVisible(false);
			this.getView().byId("claimscr").setVisible(true);
			this.createreportButtons("claimscr");

		},

		createreportButtons: function (oId) {
			var button = ["cancelbtn", "savebtn", "backbtn", "draft", "delete", "submit"];
			var button_exp = ["backbtn", "draft", "delete", "submit"];
			var button_cd = ["cancelbtn", "savebtn"];

			// select visible buttons based on visible fragment
			var button_set;
			switch (oId) {
				case "expensetypescr":
					button_set = button_exp;
					break;
				case "claimscr":
					button_set = button_cd;
					break;
			}

			var i = 0;
			for (i; i < button.length; i++) {
				var btnid = button[i];
				if (button_set.includes(btnid)) {
					this.getView().byId(btnid).setVisible(true);
				} else {
					this.getView().byId(btnid).setVisible(false);
				}
			}

		},

	});
});