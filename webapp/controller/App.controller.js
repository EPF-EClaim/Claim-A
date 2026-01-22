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

			// oRequestModel
			const oRequestModel = new JSONModel({
				purpose: "",
				reqid: "",
				type: "",
				reqstatus: "",
				startdate: "",
				enddate: "",
				indigrp: "",
				location: "",
				transport: "",
				detail: "",
				policy: "",
				costcenter: "",
				altcostcenter: "",
				cashadvtype: "",
				comment: "", 
				saved: ""
			});
			this.getView().setModel(oRequestModel, "request");


			// oReportModel
			var oReportModel = new JSONModel({
				"purpose": "",
				"startdate": "",
				"enddate": "",
				"category": "",
				"amt_approved": "",
				"comment": ""
			});
			this.getView().setModel(oReportModel, "report");
		},

		onCollapseExpandPress: function () {
			var oModel = this.getView().getModel();
			var oNavigationList = this.byId("navigationList");
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},

		onNavItemPress: function (oEvent) {
			const oItem = oEvent.getParameter("item"),
				sText = oItem.getText();
		},
		onNavItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var oKey = oItem.getKey();

			switch (oKey) {
				case "nav_createreport":
					this.onNavCreateReport();
					break;
				// Start added by Jefry 15-01-2026
				case "createrequest":
					this.onNavMyRequest();
					break;
				// End added by Jefry 15-01-2026
				default:
					this.byId("pageContainer").to(this.getView().createId(oKey));
					break;
			}
		
			// if (oKey == "createreport" || oKey == "myrequest") {
			// 	this.onClickExpenseReport();
			// } else {
			// 	this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
			// }
		},
		onNavCreateReport: async function () {
			if (!this.oDialogFragment) {
				this.oDialogFragment = await Fragment.load({
					// id: 
					// this.getView().getId(), 
					//  "createreport",

					name: "claima.fragment.createreport",
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

		onCancelFragment: function () {
			this.oDialogFragment.close();
		},

		onCreateReport: function () {
			// validate input data
			var oInputModel = this.getView().getModel("input");
			var oInputData = oInputModel.getData();

			// set as current data
			var oCurrentModel = this.getView().getModel("current");
			oCurrentModel.setData(oInputData);

			var view = "expensereport";
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
		//To show or hide fields based on Claim Item
		onClaimItemChange: function (oEvent) {
			const sKey = oEvent.getSource().getSelectedKey();
			//set ids 
			const oFe = this.byId("claimFrag--trDateFE") || this.byId("trDateFE");
			const oAltCost = this.byId("claimFrag--altcc") || this.byId("altcc");
			const oStartDate = this.byId("claimFrag--startdate") || this.byId("startdate");
			const oEndDate = this.byId("claimFrag--enddate") || this.byId("enddate");
			const oRecptnum = this.byId("claimFrag--receiptnum") || this.byId("receiptnum");
			const oVehicle = this.byId("claimFrag--vetype") || this.byId("vetype");


			const claimShow = (sKey !== "claim2");

			oFe.setVisible(claimShow);
			oAltCost.setVisible(claimShow);
			oStartDate.setVisible(claimShow);
			oEndDate.setVisible(claimShow);
			oRecptnum.setVisible(claimShow);
			oVehicle.setVisible(claimShow);



		},
		
		// Jefry_Changes++
		// Create Request Form
		onNavMyRequest: async function () {
			
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

		onClickCreateRequest: function () {
			
			// value validation
			// const oReq = this.getOwnerComponent().getModel("request");
			// const sType = oReq.getProperty("/type");
			// if (!sType) {
			// 	sap.m.MessageToast.show("Please choose a request type.");
			// 	return;
			// }

			// backend get value
			const oReqModel = this.getView().getModel("request");
			oReqModel.setProperty("/reqid", "Testing ID");
			oReqModel.setProperty("/reqstatus", "Draft")

			// Close Fragment and navigate to Request Form
			this.oDialogFragment.close();
			this.byId("pageContainer").to(this.getView().byId('new_request'));
		},

		onClickCancel: function () {
			this.oDialogFragment.close();
		},
		// ++Jefry_Changes

	});
});