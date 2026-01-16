sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(
	Controller, JSONModel
) {
	"use strict";

	return Controller.extend("claima.controller.RequestItemList", {
		
		onInit: function () {

			

			const oModel = new JSONModel({
				rows : [{
						claim_type: "Testing Claim Type1", 
						est_amount: 1000, 
						currency_code: "MYR", 
						est_no_of_participant: 10
				},{
						claim_type: "Testing Claim Type2", 
						est_amount: 1000, 
						currency_code: "MYR", 
						est_no_of_participant: 10
				},{
						claim_type: "Testing Claim Type3", 
						est_amount: 1000, 
						currency_code: "MYR", 
						est_no_of_participant: 10
				}]
			
			});
			oModel.setSizeLimit(1000);
			this.getView().setModel(oModel);

			const oTable = this.byId("req_item_table");

			// 3) Define a single press handler reused by both action items
			const fnPress = (oEvent) => {
				const oItem = oEvent.getSource();            // RowActionItem
				const sType = oItem.getType ? oItem.getType() : oItem.getText();
				const oRowCtx = oEvent.getParameter("row")   // in some versions you get row via param
							|| oTable.getContextByIndex(oEvent.getParameter("rowIndex"))
							|| oItem.getBindingContext();   // fallback
				const oData = oRowCtx && oRowCtx.getObject();

				// // You can branch by type or text
				// if (sType === "Navigation") {
				// sap.m.MessageToast.show(`Navigate → ${oData?.claim_type || ""}`);
				// // e.g., this.getOwnerComponent().getRouter().navTo("detail", {...})
				// } else {
				// sap.m.MessageToast.show(`Edit → ${oData?.claim_type || ""}`);
				// // open dialog or navigate to edit route
				// }
			};

			// 4) Build RowAction template with 2 items
			const oRowActionTemplate = new sap.ui.table.RowAction({
				items: [
				// new sap.ui.table.RowActionItem({
				// 	type: "Navigation",
				// 	press: fnPress,
				// 	visible: "{Available}"
				// }),
				new sap.ui.table.RowActionItem({
					icon: "sap-icon://edit",
					text: "Edit",
					press: fnPress
				}),
				new sap.ui.table.RowActionItem({
					icon: "sap-icon://duplicate",
					text: "Duplicate",
					press: fnPress,
					visible: "{Available}"
				}),
				new sap.ui.table.RowActionItem({
					icon: "sap-icon://delete",
					text: "Delete",
					press: fnPress,
					visible: "{Available}"
				})
				]
			});

			// 5) Apply to table
			oTable.setRowActionTemplate(oRowActionTemplate);
			oTable.setRowActionCount(3); // to match the number of items in the template

		},
	});
});