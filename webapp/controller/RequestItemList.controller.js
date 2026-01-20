sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(
	Controller, JSONModel, MessageToast
) {
	"use strict";

	return Controller.extend("claima.controller.RequestItemList", {
		
		onInit: function () {

			const oModel = new JSONModel({
				rows : [
					{claim_type: "Testing Claim Type 01", est_amount: 10100, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 02", est_amount: 100670, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 03", est_amount: 100230, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 04", est_amount: 1000, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 05", est_amount: 10300, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 06", est_amount: 1000, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 07", est_amount: 15000, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 08", est_amount: 1000, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 09", est_amount: 500, currency_code: "MYR", est_no_of_participant: 10},
					{claim_type: "Testing Claim Type 10", est_amount: 10000, currency_code: "MYR", est_no_of_participant: 10}
				]
			
			});
			oModel.setSizeLimit(50);
			this.getView().setModel(oModel);

		},

		
		onPressAddItem: function () {

			// Logic to create new item in request item list
			const oModel   = this.getView().getModel();  // JSONModel expected
            const aRows    = oModel.getProperty("/rows") || [];

			aRows.push({
                claim_type: "Testing Claim Type",
                est_amount: 100,
				currency_code: "MYR",
                est_no_of_participant: 100
			});
			
            oModel.setProperty("/rows", aRows);
			
			// Logic to navigate to Create Item Form page
			var oScroll = this.getView().getParent();          // ScrollContainer
			var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

			if (oMaybeNav && typeof oMaybeNav.to === "function") {
				
				var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
				var oCreatePage = aPages && aPages.find(function (p) {
				return p.getId && p.getId().endsWith("req_create_item_view");
				});

				if (oCreatePage) {
				oMaybeNav.to(oCreatePage, "slide");
				return;
				}
			}

            
		},


		onRowDelete: function (oEvent) {
            const oTable   = this.byId("req_item_table");
            const oBinding = oTable.getBinding("rows");  // ListBinding/RowBinding
            const oModel   = this.getView().getModel();  // JSONModel expected
            const aRows    = oModel.getProperty("/rows") || [];

            // collect visible selected indices (e.g., [0, 2, 5])
            let aSelectedVisIdx = oTable.getSelectedIndices() || [];
            let aModelIdxToDelete = [];

            // Helper to get a context for a visible index in a version-safe way
            const getCtxByVisibleIndex = function (iVis) {
                // Preferred: table API (exists on sap.ui.table.Table)
                if (typeof oTable.getContextByIndex === "function") {
                return oTable.getContextByIndex(iVis) || null;
                }
                // Fallback: binding API
                if (oBinding && typeof oBinding.getContexts === "function") {
                const aCtx = oBinding.getContexts(iVis, 1);
                return aCtx && aCtx[0] ? aCtx[0] : null;
                }
                return null;
            };

            if (aSelectedVisIdx.length > 0) {
                aModelIdxToDelete = aSelectedVisIdx
                .map(function (iVis) {
                    const oCtx = getCtxByVisibleIndex(iVis);
                    if (!oCtx) return null;
                    const sPath = oCtx.getPath();      // e.g., "/rows/3"
                    const iIdx  = parseInt(sPath.split("/").pop(), 10);
                    return Number.isInteger(iIdx) ? iIdx : null;
                })
                .filter(function (x) { return x !== null; });
            } else {
                // Nothing selected → delete row where the action was pressed
                const oActionItem = oEvent.getSource();                // RowActionItem
                const oRow        = oActionItem?.getParent()?.getParent(); // RowAction -> Row
                const oCtx        = oRow?.getBindingContext();
                if (oCtx) {
					const sPath = oCtx.getPath();
					const iIdx  = parseInt(sPath.split("/").pop(), 10);
					if (Number.isInteger(iIdx)) {
						aModelIdxToDelete = [iIdx];
					}
                }
            }

            if (aModelIdxToDelete.length === 0) {
                MessageToast.show("Select row to delete");
            }

            // De-dup and sort desc so splice doesn’t shift later indices
            aModelIdxToDelete = Array.from(new Set(aModelIdxToDelete))
                .sort(function (a, b) { return b - a; });

            aModelIdxToDelete.forEach(function (iIdx) {
                if (iIdx >= 0 && iIdx < aRows.length) {
                aRows.splice(iIdx, 1);
                }
            });

            // Optional: keep one empty row to support your auto-append UX
            // if (aRows.length === 0) {
            //     aRows.push({
            //     participant_name: "",
            //     emp_cost_center: "",
            //     alloc_amount: ""
            //     });
            // }		

            oModel.setProperty("/rows", aRows);
            oTable.clearSelection();
        },

        
        onDeleteSelected: function () {
            // Reuse the same logic by faking a call without a pressed row
            this.onRowDelete({ getSource: function () { return null; } });
        }, 

		onSelectEdit: function () {
			var oScroll = this.getView().getParent();          // should be the ScrollContainer
			var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

			if (oMaybeNav && typeof oMaybeNav.to === "function") {
				// Get the sibling page (req_create_item_view) **inside the same NavContainer**
				var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
				var oCreatePage = aPages && aPages.find(function (p) {
				return p.getId && p.getId().endsWith("req_create_item_view");
				});

				if (oCreatePage) {
				oMaybeNav.to(oCreatePage, "slide");
				return;
				}
			}

		}
	});
});