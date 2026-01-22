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
				req_item_rows : [
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

            const oVM = new sap.ui.model.json.JSONModel({
                visibleCount: 0, // number of rows currently shown (respects filters)
                totalCount: 0,   // total items in the underlying array (no filters)
                selectedCount: 0 // selected row count (if you use selection)
            });
            this.getView().setModel(oVM, "view");


		},

		
		onPressAddItem: function () {
			
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
				}
			}

            // Logic to create new item in request item list
			const oModel   = this.getView().getModel();  // JSONModel expected
            const aRows    = oModel.getProperty("/req_item_rows") || [];

			aRows.push({
                claim_type: "Testing Claim Type",
                est_amount: 100,
				currency_code: "MYR",
                est_no_of_participant: 100
			});
			
            oModel.setProperty("/req_item_rows", aRows);

		},

		onRowDelete: function (oEvent) {
            const oTable   = this.byId("req_item_table");
            const oBinding = oTable.getBinding("req_item_rows");
            const oModel   = this.getView().getModel();  
            const aRows    = oModel.getProperty("/req_item_rows") || [];

            let aSelectedVisIdx = oTable.getSelectedIndices() || [];
            let aModelIdxToDelete = [];

            const getCtxByVisibleIndex = function (iVis) {
                if (typeof oTable.getContextByIndex === "function") {
                return oTable.getContextByIndex(iVis) || null;
                }
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
                    const sPath = oCtx.getPath();     
                    const iIdx  = parseInt(sPath.split("/").pop(), 10);
                    return Number.isInteger(iIdx) ? iIdx : null;
                })
                .filter(function (x) { return x !== null; });
            } else {
                const oActionItem = oEvent.getSource();               
                const oRow        = oActionItem?.getParent()?.getParent(); 
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

            aModelIdxToDelete = Array.from(new Set(aModelIdxToDelete))
                .sort(function (a, b) { return b - a; });

            aModelIdxToDelete.forEach(function (iIdx) {
                if (iIdx >= 0 && iIdx < aRows.length) {
                aRows.splice(iIdx, 1);
                }
            });

            oModel.setProperty("/req_item_rows", aRows);
            oTable.clearSelection();
        },

        onDeleteSelected: function () {
            
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

		}, 
        
        // Count Request Item
        onAfterRendering: function () {
            const oTable = this.byId("req_item_table"); // sap.ui.table.Table
            if (!oTable) return;

            // Avoid multiple attachments if onAfterRendering runs again
            if (this._countsAttached) {
                return;
            }
            this._countsAttached = true;

            const fnAttachWhenReady = () => {
                const oBinding = oTable.getBinding("rows"); // <-- MUST be "rows"
                if (!oBinding) {
                    // Try again on next tick if binding isn’t there yet
                    setTimeout(fnAttachWhenReady, 0);
                return;
                }

                // Listen for changes that affect row contexts/length
                oBinding.attachEvent("change", this._updateTableCounts, this);
                oBinding.attachEvent("dataReceived", this._updateTableCounts, this);
                oBinding.attachEvent("refresh", this._updateTableCounts, this);

                // If you support selection, also update on selection change
                oTable.attachRowSelectionChange(this._updateSelectedCount, this);

                // Initial compute
                this._updateTableCounts();
            };

            fnAttachWhenReady();
        },

        _updateTableCounts: function () {
            const oTable   = this.byId("req_item_table");
            const oBinding = oTable.getBinding("rows"); // <-- FIXED: use "rows"
            const oVM      = this.getView().getModel("view"); // holds /visibleCount, /totalCount

            // visibleCount = number of rows currently shown (respects filters)
            let visibleCount = 0;
            if (oBinding) {
                visibleCount = oBinding.getLength();
            }

            // totalCount = total items in your backing array (no filters)
            const oJSON = this.getView().getModel();  // default JSONModel
            const aAll  = oJSON ? (oJSON.getProperty("/req_item_rows") || []) : [];
            const totalCount = aAll.length;

            // write both values; useful if you show both in UI
            oVM.setProperty("/visibleCount", visibleCount);
            oVM.setProperty("/totalCount", totalCount);

            // Optional: keep selectedCount in sync if you display it
            if (typeof this._updateSelectedCount === "function") {
                this._updateSelectedCount();
            }
        },

        _updateSelectedCount: function () {
            const oTable = this.byId("req_item_table");
            const oVM    = this.getView().getModel("view");
            const aSel   = oTable.getSelectedIndices ? oTable.getSelectedIndices() : [];
            oVM.setProperty("/selectedCount", aSel.length);
        },

        // (Optional) Clean up if the view is destroyed
        onExit: function () {
            const oTable = this.byId && this.byId("req_item_table");
            if (oTable && this._countsAttached) {
                const oBinding = oTable.getBinding("rows");
                if (oBinding) {
                oBinding.detachEvent("change", this._updateTableCounts, this);
                oBinding.detachEvent("dataReceived", this._updateTableCounts, this);
                oBinding.detachEvent("refresh", this._updateTableCounts, this);
                }
                oTable.detachRowSelectionChange(this._updateSelectedCount, this);
            }
            this._countsAttached = false;
        }


	});
});