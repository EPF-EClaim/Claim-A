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

			// oViewModel
			const oViewModel = new sap.ui.model.json.JSONModel({
					rtype: "" // current selected request type
			});
			this.getView().setModel(oViewModel, "view");

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
					this.onClickMyRequest();
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
		// Start added by Jefry Yap 15-01-2026
		onClickMyRequest: async function () {
			// const oConfig = new JSONModel({
            //     types: [
            //     { key: "T1", text: "Type A" },
            //     { key: "T2", text: "Type B" },
            //     { key: "T3", text: "Type C" },
            //     { key: "T4", text: "Type D" },
            //     { key: "T5", text: "Type E" }
            //     ],
            //     fieldSets: {
            //         type: {
            //             T1: [
            //                 { id: "priority", label: "Priority", control: "Select", path: "/form/priority",
            //                     items: [
            //                     { key: "H", text: "High" },
            //                     { key: "M", text: "Medium" },
            //                     { key: "L", text: "Low" }
            //                     ],
            //                     required: true
            //                 }
            //             ],
            //             T2: [
            //                 { id: "amount", label: "Amount", control: "Input", type: "Number", path: "/form/amount" }
            //             ],
            //             T3: [
            //                 { id: "costCenter", label: "Cost Center", control: "Input", path: "/form/costCenter" }
            //             ],
            //             T4: [
            //                 { id: "attachment", label: "Attachment", control: "FileUploader", path: "/form/attachment" }
            //             ],
            //             T5: [
            //                 { id: "category", label: "Category", control: "Select", path: "/form/category",
            //                     items: [
            //                     { key: "A", text: "Cat A" },
            //                     { key: "B", text: "Cat B" }
            //                     ]
            //                 }
            //             ]
            //         }
            //     },
            //     selection: { purpose: "", type: "" },
            //     form: {}
            // });
            // this.getView().setModel(oConfig, "config");

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
		},

		
		onDialogCancel: function (oEvent) {
			oEvent.getSource().getParent().close();
		},

		onDialogAfterClose: function () {
			// cleanup if needed
		},

		onPurposeChange: function () {
			this._rebuildDynamicForm();
		},

		onTypeChange: function () {
			this._rebuildDynamicForm();
		},

		// Build/refresh fields every time purpose/type changes
		_rebuildDynamicForm: function () {
			const oView = this.getView();
			const oConfig = oView.getModel("config");
			const oSF = oView.byId("dynForm");

			// Clear previous content
			oSF.destroyContent();

			const sPurpose = oConfig.getProperty("/selection/purpose");
			const sType = oConfig.getProperty("/selection/type");

			const aPurposeFields = (sPurpose && oConfig.getProperty("/fieldSets/purpose/" + sPurpose)) || [];
			const aTypeFields    = (sType && oConfig.getProperty("/fieldSets/type/" + sType)) || [];

			// Merge fields; you can also dedupe by id if overlaps possible
			const aFields = aPurposeFields.concat(aTypeFields);

			// Early return if nothing selected
			if (!aFields.length) {
				return;
			}

			// Generate form elements
			aFields.forEach(function (fdef) {
				// Label
				oSF.addContent(new sap.m.Label({
				text: fdef.label,
				required: !!fdef.required,
				labelFor: fdef.id
				}));

				// Control factory
				let oCtrl = null;
				switch (fdef.control) {
				case "Input":
					oCtrl = new Input(fdef.id, {
					type: fdef.type === "Number" ? "Number" : "Text",
					value: "{config>" + fdef.path + "}"
					});
					break;

				case "TextArea":
					oCtrl = new TextArea(fdef.id, {
					value: "{config>" + fdef.path + "}",
					rows: 3,
					growing: true
					});
					break;

				case "DatePicker":
					oCtrl = new DatePicker(fdef.id, {
					value: "{config>" + fdef.path + "}",
					valueFormat: "yyyy-MM-dd",
					displayFormat: "medium"
					});
					break;

				case "Select":
					oCtrl = new Select(fdef.id, {
					selectedKey: "{config>" + fdef.path + "}"
					});
					// local items
					if (Array.isArray(fdef.items)) {
					fdef.items.forEach(function (it) {
						oCtrl.addItem(new Item({ key: it.key, text: it.text }));
					});
					} else if (fdef.itemsPath) {
					// dynamic items binding example
					oCtrl.bindItems({
						path: "config>" + fdef.itemsPath,
						template: new Item({ key: "{config>key}", text: "{config>text}" })
					});
					}
					break;

				case "FileUploader":
					oCtrl = new FileUploader(fdef.id, {
					fileType: ["pdf", "png", "jpg"],
					maximumFileSize: 10, // MB
					change: this._onFileSelected.bind(this, fdef.path)
					});
					break;

				default:
					oCtrl = new Input(fdef.id, {
					value: "{config>" + fdef.path + "}"
					});
				}

				// Simple required check on change (optional)
				if (fdef.required && oCtrl.setValueState) {
				const fnValidate = () => {
					const v = oConfig.getProperty(fdef.path);
					const empty = v === undefined || v === null || v === "";
					oCtrl.setValueState(empty ? ValueState.Error : ValueState.None);
				};
				oCtrl.attachChange(fnValidate);
				// run once
				setTimeout(fnValidate, 0);
				}

				oSF.addContent(oCtrl);
			}, this);
		},

		_onFileSelected: function (sPath, oEvent) {
			// You can store the File name only, or upload immediately
			const oFile = oEvent.getParameter("files")?.[0];
			if (oFile) {
				const oModel = this.getView().getModel("config");
				oModel.setProperty(sPath, oFile.name);
			}
		},

		onSubmit: function (oEvent) {
			const oModel = this.getView().getModel("config");
			const sPurpose = oModel.getProperty("/selection/purpose");
			const sType = oModel.getProperty("/selection/type");

			// Basic validation
			const aPurposeFields = (sPurpose && oModel.getProperty("/fieldSets/purpose/" + sPurpose)) || [];
			const aTypeFields    = (sType && oModel.getProperty("/fieldSets/type/" + sType)) || [];
			const aFields = aPurposeFields.concat(aTypeFields);

			const missing = aFields.filter(f => f.required).filter(f => {
				const v = oModel.getProperty(f.path);
				return v === undefined || v === null || v === "";
			});

			if (missing.length) {
				sap.m.MessageToast.show("Please fill all required fields.");
				return;
			}

			// Collect payload
			const oPayload = {
				purpose: sPurpose,
				type: sType,
				data: oModel.getProperty("/form")
			};

			// TODO: call backend or proceed
			console.log("Submitting:", oPayload);
			// Close dialog
			oEvent.getSource().getParent().close();
		}

		// End added by Jefry Yap 15-01-2026

	});
});