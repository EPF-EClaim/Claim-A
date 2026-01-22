sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("claima.controller.RequestFormItem", {
        onInit: function () {

            const oModel = new JSONModel({
                participant : [
                    {
                        participant_name: "",
                        emp_cost_center: "",
                        alloc_amount: ""
                    }
                ]
            });

            this.getView().setModel(oModel);
        },

        appendNewRow: function (oEvent) {
            const sVal = (oEvent.getParameter("value") || "").trim();
            const oCtx = oEvent.getSource().getBindingContext(); 
            if (!oCtx) { return; }

            const sPath  = oCtx.getPath(); 
            const iIndex = parseInt(sPath.split("/").pop(), 10);

            const oModel = oCtx.getModel(); 
            const aRows  = oModel.getProperty("/participant") || [];

            if (aRows[iIndex]) {
                aRows[iIndex].participant_name = sVal;
            }

            this._normalizeTrailingEmptyRow(aRows);

            const bIsLast = iIndex === aRows.length - 1;
            if (bIsLast && sVal) {
                aRows.push({
                    participant_name: "",
                    emp_cost_center: "",
                    alloc_amount: "" 
                });
            }

            oModel.setProperty("/participant", aRows);
            // If table uses growing, you might need a .refresh(true) in some setups
            // oModel.refresh(true);

        },

        _normalizeTrailingEmptyRow: function (aRows) {
            // Remove extra trailing empties if any
            while (aRows.length > 1 && this._isEmptyRow(aRows[aRows.length - 1]) && this._isEmptyRow(aRows[aRows.length - 2])) {
                aRows.pop();
            }
            // If list became empty (shouldn't happen), ensure at least one blank row
            if (aRows.length === 0) {
                aRows.push({ participant_name: "", emp_cost_center: "", alloc_amount: "" });
            }
        },

        
        _isEmptyRow: function (oRow) {
            if (!oRow) return true;
            const nameEmpty  = !oRow.participant_name || String(oRow.participant_name).trim() === "";
            const costEmpty  = !oRow.emp_cost_center || String(oRow.emp_cost_center).trim() === "";
            const allocEmpty = !oRow.alloc_amount || String(oRow.alloc_amount).trim() === "";
            return nameEmpty && costEmpty && allocEmpty;
        },

        onRowDelete: function (oEvent) {
            const oTable   = this.byId("req_participant_table");
            const oBinding = oTable.getBinding("participant");  // ListBinding/RowBinding
            const oModel   = this.getView().getModel();  // JSONModel expected
            const aRows    = oModel.getProperty("/participant") || [];

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
            if (aRows.length === 0) {
                aRows.push({
                participant_name: "",
                emp_cost_center: "",
                alloc_amount: ""
                });
            }

            oModel.setProperty("/participant", aRows);
            oTable.clearSelection();
        },

        
        onDeleteSelected: function () {
            // Reuse the same logic by faking a call without a pressed row
            this.onRowDelete({ getSource: function () { return null; } });
        },
        
        onCancel: function () {
            var oComp   = sap.ui.core.Component.getOwnerComponentFor(this.getView());
            var oNav    = oComp && oComp.byId("req_form_item_container");
            var oTarget = oComp && oComp.byId("req_item_table_view"); // back to list

            if (oNav && oTarget) {
                oNav.to(oTarget);
                return;
            }

            var oScroll = this.getView().getParent();          // should be the ScrollContainer
			var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

			if (oMaybeNav && typeof oMaybeNav.to === "function") {
				// Get the sibling page (req_create_item_view) **inside the same NavContainer**
				var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
				var oCreatePage = aPages && aPages.find(function (p) {
				return p.getId && p.getId().endsWith("req_item_table_view");
				});

				if (oCreatePage) {
				oMaybeNav.to(oCreatePage, "slide");
				return;
				}
			}
        },

        onSave: function () {
            // ... validate & persist your item ...
            // Then navigate back:
            this.onCancel();
        },

        onSaveAddAnother: function () {
            // Logic to create new item in request item list
            var oScroll = this.getView().getParent();          // ScrollContainer
            var oMaybeNav = oScroll && oScroll.getParent && oScroll.getParent(); // NavContainer

            var aPages = oMaybeNav.getPages ? oMaybeNav.getPages() : oMaybeNav.getAggregation("pages");
            var oListPage = aPages && aPages.find(function (p) {
                return p.getId && p.getId().endsWith("req_item_table_view");
            });

            if (oListPage) {
                const oModel   = oListPage.getModel();  // JSONModel expected
                const aRows    = oModel.getProperty("/req_item_list") || [];
                
                aRows.push({
                    claim_type: "Testing Claim Type",
                    est_amount: 100,
                    currency_code: "MYR",
                    est_no_of_participant: 100
                });
                
                oModel.setProperty("/req_item_list", aRows);
            }
        },
    });
});