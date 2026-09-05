import React, { useState, useCallback, useRef } from 'react';

export interface CellCoord {
  table: string;
  r: number;
  c: number;
}

export interface CellRange {
  table: string;
  startR: number;
  startC: number;
  endR: number;
  endC: number;
}

export function useMtc4Excel(
  getTableData: (table: string) => string[][],
  setTableData: (table: string, newData: string[][]) => void
) {
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const isShiftNavRef = useRef(false);

  const isCellSelected = useCallback((table: string, r: number, c: number) => {
    if (!selectedRange || selectedRange.table !== table) {
      return activeCell?.table === table && activeCell.r === r && activeCell.c === c;
    }
    const minR = Math.min(selectedRange.startR, selectedRange.endR);
    const maxR = Math.max(selectedRange.startR, selectedRange.endR);
    const minC = Math.min(selectedRange.startC, selectedRange.endC);
    const maxC = Math.max(selectedRange.startC, selectedRange.endC);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  }, [selectedRange, activeCell]);

  const selectCell = useCallback((table: string, r: number, c: number, extendRange: boolean = false) => {
    if (isShiftNavRef.current) {
      setActiveCell({ table, r, c });
      return;
    }
    setActiveCell({ table, r, c });
    if (extendRange && selectedRange && selectedRange.table === table) {
      setSelectedRange({
        table,
        startR: selectedRange.startR,
        startC: selectedRange.startC,
        endR: r,
        endC: c
      });
    } else {
      setSelectedRange({
        table,
        startR: r,
        startC: c,
        endR: r,
        endC: c
      });
    }
  }, [selectedRange]);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    table: string,
    r: number,
    c: number,
    totalRows: number,
    totalCols: number
  ) => {
    e.stopPropagation();
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // 1. ESC: Clear selection and blur cell
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedRange(null);
      setActiveCell(null);
      (e.target as HTMLElement)?.blur();
      return;
    }

    // 2. DELETE / BACKSPACE when a range or selected cell is highlighted
    if ((e.key === 'Delete' || (e.key === 'Backspace' && selectedRange && (selectedRange.startR !== selectedRange.endR || selectedRange.startC !== selectedRange.endC))) && !isCtrlOrCmd) {
      e.preventDefault();
      const currentMatrix = getTableData(table);
      const newMatrix = currentMatrix.map(row => [...row]);

      if (selectedRange && selectedRange.table === table) {
        const minR = Math.min(selectedRange.startR, selectedRange.endR);
        const maxR = Math.max(selectedRange.startR, selectedRange.endR);
        const minC = Math.min(selectedRange.startC, selectedRange.endC);
        const maxC = Math.max(selectedRange.startC, selectedRange.endC);

        for (let ri = minR; ri <= maxR; ri++) {
          for (let ci = minC; ci <= maxC; ci++) {
            if (newMatrix[ri]) {
              newMatrix[ri][ci] = '';
            }
          }
        }
      } else {
        if (newMatrix[r]) {
          newMatrix[r][c] = '';
        }
      }
      setTableData(table, newMatrix);
      return;
    }

    // 3. CTRL + D: Copy upper cell or Fill down
    if (isCtrlOrCmd && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const currentMatrix = getTableData(table);
      const newMatrix = currentMatrix.map(row => [...row]);

      if (selectedRange && selectedRange.table === table) {
        const minR = Math.min(selectedRange.startR, selectedRange.endR);
        const maxR = Math.max(selectedRange.startR, selectedRange.endR);
        const minC = Math.min(selectedRange.startC, selectedRange.endC);
        const maxC = Math.max(selectedRange.startC, selectedRange.endC);

        if (minR < maxR) {
          // Fill down from the top row of selection to all rows below
          for (let rowIdx = minR + 1; rowIdx <= maxR; rowIdx++) {
            for (let colIdx = minC; colIdx <= maxC; colIdx++) {
              if (newMatrix[minR] && newMatrix[rowIdx]) {
                newMatrix[rowIdx][colIdx] = newMatrix[minR][colIdx] || '';
              }
            }
          }
        } else if (minR > 0) {
          // Single row selected: copy from the row directly above
          for (let colIdx = minC; colIdx <= maxC; colIdx++) {
            if (newMatrix[minR - 1] && newMatrix[minR]) {
              newMatrix[minR][colIdx] = newMatrix[minR - 1][colIdx] || '';
            }
          }
        }
      } else if (r > 0) {
        // Copy single cell from row above
        if (newMatrix[r - 1] && newMatrix[r]) {
          newMatrix[r][c] = newMatrix[r - 1][c] || '';
        }
      }
      setTableData(table, newMatrix);
      return;
    }

    // 4. CTRL + C: Copy selected range or active cell as TSV
    if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
      const currentMatrix = getTableData(table);
      let tsvText = '';

      if (selectedRange && selectedRange.table === table) {
        const minR = Math.min(selectedRange.startR, selectedRange.endR);
        const maxR = Math.max(selectedRange.startR, selectedRange.endR);
        const minC = Math.min(selectedRange.startC, selectedRange.endC);
        const maxC = Math.max(selectedRange.startC, selectedRange.endC);

        const rows: string[] = [];
        for (let ri = minR; ri <= maxR; ri++) {
          const rowCells: string[] = [];
          for (let ci = minC; ci <= maxC; ci++) {
            rowCells.push(currentMatrix[ri]?.[ci] ?? '');
          }
          rows.push(rowCells.join('\t'));
        }
        tsvText = rows.join('\n');
      } else {
        tsvText = currentMatrix[r]?.[c] ?? '';
      }

      if (tsvText !== undefined) {
        navigator.clipboard.writeText(tsvText).catch(() => {});
      }
      return;
    }

    // 5. Arrow Keys with SHIFT: Range Selection (Shift + Up / Down / Left / Right)
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const currStartR = (selectedRange && selectedRange.table === table) ? selectedRange.startR : r;
      const currStartC = (selectedRange && selectedRange.table === table) ? selectedRange.startC : c;
      const currEndR = (selectedRange && selectedRange.table === table) ? selectedRange.endR : r;
      const currEndC = (selectedRange && selectedRange.table === table) ? selectedRange.endC : c;

      let nextEndR = currEndR;
      let nextEndC = currEndC;

      if (e.key === 'ArrowUp') nextEndR = Math.max(0, currEndR - 1);
      if (e.key === 'ArrowDown') nextEndR = Math.min(totalRows - 1, currEndR + 1);
      if (e.key === 'ArrowLeft') nextEndC = Math.max(0, currEndC - 1);
      if (e.key === 'ArrowRight') nextEndC = Math.min(totalCols - 1, currEndC + 1);

      isShiftNavRef.current = true;
      setSelectedRange({
        table,
        startR: currStartR,
        startC: currStartC,
        endR: nextEndR,
        endC: nextEndC
      });
      setActiveCell({ table, r: nextEndR, c: nextEndC });

      const nextElem = document.querySelector(`[data-cell="${table}_${nextEndR}_${nextEndC}"]`) as HTMLInputElement;
      if (nextElem) {
        nextElem.focus();
        nextElem.select();
      }
      setTimeout(() => {
        isShiftNavRef.current = false;
      }, 100);
      return;
    }

    // 6. Navigation without shift (Arrow Keys, Enter, Tab)
    if (!e.shiftKey && !isCtrlOrCmd) {
      // Normalize current input value if it has a leading decimal (e.g. .15 -> 0.15)
      const inputVal = (e.target as HTMLInputElement)?.value;
      if (inputVal && typeof inputVal === 'string' && /^\s*([+-])?\.(\d+.*)$/.test(inputVal)) {
        const normalized = inputVal.replace(/^\s*([+-])?\.(\d+.*)$/, (_m, sign, rest) => (sign || '') + '0.' + rest);
        const currentMatrix = getTableData(table);
        const newMatrix = currentMatrix.map(row => [...row]);
        if (newMatrix[r]) {
          newMatrix[r][c] = normalized;
          setTableData(table, newMatrix);
        }
      }

      if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
        e.preventDefault();
        const nextR = Math.max(0, r - 1);
        selectCell(table, nextR, c);
        const nextElem = document.querySelector(`[data-cell="${table}_${nextR}_${c}"]`) as HTMLInputElement;
        nextElem?.focus();
        nextElem?.select();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        const nextR = Math.min(totalRows - 1, r + 1);
        selectCell(table, nextR, c);
        const nextElem = document.querySelector(`[data-cell="${table}_${nextR}_${c}"]`) as HTMLInputElement;
        nextElem?.focus();
        nextElem?.select();
        return;
      }
      if (e.key === 'ArrowLeft' && ((e.target as HTMLInputElement)?.selectionStart === 0 && (e.target as HTMLInputElement)?.selectionEnd === 0)) {
        if (c > 0) {
          e.preventDefault();
          selectCell(table, r, c - 1);
          const nextElem = document.querySelector(`[data-cell="${table}_${r}_${c - 1}"]`) as HTMLInputElement;
          nextElem?.focus();
          nextElem?.select();
          return;
        }
      }
      if (e.key === 'ArrowRight' && ((e.target as HTMLInputElement)?.selectionStart === (e.target as HTMLInputElement)?.value?.length)) {
        if (c < totalCols - 1) {
          e.preventDefault();
          selectCell(table, r, c + 1);
          const nextElem = document.querySelector(`[data-cell="${table}_${r}_${c + 1}"]`) as HTMLInputElement;
          nextElem?.focus();
          nextElem?.select();
          return;
        }
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextC = c + 1 < totalCols ? c + 1 : 0;
        const nextR = c + 1 < totalCols ? r : Math.min(totalRows - 1, r + 1);
        selectCell(table, nextR, nextC);
        const nextElem = document.querySelector(`[data-cell="${table}_${nextR}_${nextC}"]`) as HTMLInputElement;
        nextElem?.focus();
        nextElem?.select();
        return;
      }
    }
  }, [getTableData, setTableData, selectedRange, selectCell]);

  const handlePaste = useCallback((
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    table: string,
    startR: number,
    startC: number
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;

    if (!text.includes('\t') && !text.includes('\n')) {
      // Single value paste: If multiple cells are selected in a range, fill all selected cells!
      if (selectedRange && selectedRange.table === table && (selectedRange.startR !== selectedRange.endR || selectedRange.startC !== selectedRange.endC)) {
        e.preventDefault();
        const minR = Math.min(selectedRange.startR, selectedRange.endR);
        const maxR = Math.max(selectedRange.startR, selectedRange.endR);
        const minC = Math.min(selectedRange.startC, selectedRange.endC);
        const maxC = Math.max(selectedRange.startC, selectedRange.endC);

        const currentMatrix = getTableData(table);
        const newMatrix = currentMatrix.map(row => [...row]);
        for (let ri = minR; ri <= maxR; ri++) {
          for (let ci = minC; ci <= maxC; ci++) {
            if (newMatrix[ri]) {
              newMatrix[ri][ci] = text.trim();
            }
          }
        }
        setTableData(table, newMatrix);
        return;
      }
      return;
    }

    e.preventDefault();
    const rows = text.split(/\r\n|\r|\n/).map(row => row.split('\t'));
    const currentMatrix = getTableData(table);
    const newMatrix = currentMatrix.map(row => [...row]);

    for (let ri = 0; ri < rows.length; ri++) {
      const targetR = startR + ri;
      if (targetR >= newMatrix.length) break;
      for (let ci = 0; ci < rows[ri].length; ci++) {
        const targetC = startC + ci;
        if (targetC >= (newMatrix[targetR]?.length || 0)) break;
        newMatrix[targetR][targetC] = rows[ri][ci].trim();
      }
    }

    setTableData(table, newMatrix);
  }, [getTableData, setTableData, selectedRange]);

  return {
    activeCell,
    selectedRange,
    isCellSelected,
    selectCell,
    setSelectedRange,
    handleKeyDown,
    handlePaste
  };
}
