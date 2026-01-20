sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("claima.controller.RequestFormItem", {
        onInit: function () {

            const oModel = new JSONModel({
                rows : [
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
            const aRows  = oModel.getProperty("/rows") || [];

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

            oModel.setProperty("/rows", aRows);
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
            if (aRows.length === 0) {
                aRows.push({
                participant_name: "",
                emp_cost_center: "",
                alloc_amount: ""
                });
            }

            oModel.setProperty("/rows", aRows);
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

        // WIP
        onImportChange: function (oEvent) {
            const oFile = oEvent.getParameter("files")?.[0];
            if (!oFile) { return; }

            const sName = oFile.name.toLowerCase();
            const isCSV  = sName.endsWith(".csv");
            const isXLSX = sName.endsWith(".xlsx") || sName.endsWith(".xls");

            if (!isCSV && !isXLSX) {
                sap.m.MessageBox.error("Supported file types: .xlsx, .csv");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let aRows = [];
                    if (isCSV) {
                        const text = e.target.result;
                        aRows = this._parseCSVToRows(text);
                    } else {
                        if (!window.XLSX) {
                        sap.m.MessageBox.error("XLSX library not loaded. Include xlsx.full.min.js.");
                        return;
                        }
                        const data = new Uint8Array(e.target.result);
                        const wb = window.XLSX.read(data, { type: "array" });
                        const wsName = wb.SheetNames[0];
                        const ws = wb.Sheets[wsName];
                        // Convert to array of objects using header row
                        const json = window.XLSX.utils.sheet_to_json(ws, { defval: "" }); // [{Header1:..., Header2:...}, ...]
                        aRows = this._xlsxJsonToRows(json);
                    }

                    this._applyImportedRows(aRows);
                    sap.m.MessageToast.show(`Imported ${aRows.length} row(s) from ${oFile.name}`);
                    this.byId("fuImport").clear();
                } catch (err) {
                    sap.m.MessageBox.error("Failed to import file: " + err.message);
                }
            };

            if (isCSV) {
                reader.readAsText(oFile, "utf-8");
            } else {
                reader.readAsArrayBuffer(oFile);
            }
        },

        _xlsxJsonToRows: function (aJson) {
            const norm = (s) => String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
            const mapField = (obj, keys) => {
                for (const k of Object.keys(obj)) {
                const nk = norm(k);
                if (keys.includes(nk)) { return String(obj[k] ?? "").trim(); }
                }
                return "";
            };

            return (aJson || []).map(o => ({
                participant_name: mapField(o, ["participant_name","participant","participant name"]),
                emp_cost_center:  mapField(o, ["emp_cost_center","cost center","employee cost center","costcenter"]),
                alloc_amount:     this._normalizeAmount(mapField(o, ["alloc_amount","amount","allocated amount","allocation"]))
            })).filter(o => this._hasAnyValue(o));
        },


        /** Very small CSV parser supporting quoted fields, commas and newlines in quotes */
        _parseCSVToRows: function (csvText) {
            // Normalize line endings
            const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

            // Split to rows considering quotes
            const rows = [];
            let row = [], field = "", inQuotes = false;

            const pushField = () => { row.push(field); field = ""; };
            const pushRow = () => { rows.push(row); row = []; };

            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                if (inQuotes) {
                if (c === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
                    else { inQuotes = false; }
                } else {
                    field += c;
                }
                } else {
                if (c === '"') { inQuotes = true; }
                else if (c === ",") { pushField(); }
                else if (c === "\n") { pushField(); pushRow(); }
                else { field += c; }
                }
            }
            // last field/row
            pushField();
            if (row.length > 1 || (row.length === 1 && row[0] !== "")) { pushRow(); }

            if (rows.length === 0) { return []; }

            // Header mapping
            const header = rows[0].map(h => this._normHeader(h));
            const idx = {
                participant_name: header.findIndex(h => ["participant_name","participant","participant name"].includes(h)),
                emp_cost_center:  header.findIndex(h => ["emp_cost_center","cost center","employee cost center","costcenter"].includes(h)),
                alloc_amount:     header.findIndex(h => ["alloc_amount","amount","allocated amount","allocation"].includes(h))
            };

            const dataRows = rows.slice(1).map(r => ({
                participant_name: this._getCell(r, idx.participant_name),
                emp_cost_center:  this._getCell(r, idx.emp_cost_center),
                alloc_amount:     this._normalizeAmount(this._getCell(r, idx.alloc_amount))
            })).filter(o => this._hasAnyValue(o));

            return dataRows;
        },

        _normHeader: function (s) {
            return String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
        },
        _getCell: function (arr, i) {
            return i >= 0 && i < arr.length ? String(arr[i]).trim() : "";
        },
        _normalizeAmount: function (s) {
            if (!s) return "";
            // Remove currency symbols and thousand separators, keep dot as decimal.
            s = String(s).replace(/[^\d.,-]/g, "").replace(/,/g, "");
            return s;
        },
        _hasAnyValue: function (o) {
            return (o.participant_name && o.participant_name.trim() !== "") ||
                    (o.emp_cost_center && o.emp_cost_center.trim() !== "") ||
                    (o.alloc_amount && o.alloc_amount.trim() !== "");
        },

        _applyImportedRows: function (aRows) {
            const oModel = this.getView().getModel(); // default JSONModel
            if (!Array.isArray(aRows)) { aRows = []; }

            // Optional: merge with existing rows (excluding trailing blank row if any)
            const aExisting = oModel.getProperty("/rows") || [];
            const aCleanExisting = aExisting.filter(r => r.participant_name || r.emp_cost_center || r.alloc_amount);

            // Combine and ensure at least one trailing blank row
            const aCombined = aCleanExisting.concat(aRows);
            if (aCombined.length === 0 || this._rowHasValues(aCombined[aCombined.length - 1])) {
                aCombined.push({ participant_name: "", emp_cost_center: "", alloc_amount: "" });
            }

            oModel.setProperty("/rows", aCombined);

            // Clear selection if using sap.ui.table.Table
            const oTable = this.byId("req_participant_table");
            oTable?.clearSelection?.();
        },

        _rowHasValues: function (r) {
            if (!r) return false;
            return (r.participant_name && r.participant_name.trim() !== "") ||
                    (r.emp_cost_center && r.emp_cost_center.trim() !== "") ||
                    (r.alloc_amount && r.alloc_amount.trim() !== "");
        },
    
    });
});