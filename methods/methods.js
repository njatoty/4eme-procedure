const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
// variables
const PLAFOND_SALARIAL = 262680;
const DUREE_PLAFONNEE = 8;
const TAUX_DE_RETENUE_CNAPS = '1%';

const ColumnName = {
    nom: 'A',
    matricule: 'B',
    salaire_base: 'C',
    temps_travaille: 'D',
    salaire_correspondant: 'E',

    // heure supplementaires
    heure_suppl_30: 'F',
    heure_suppl_50: 'G',
    heure_suppl_100: 'H',
    heure_suppl_130: 'I',
    heure_suppl_150: 'J',

    // indemnités impos
    transport: 'K',
    repas: 'L',

    preavis: 'M',
    conge_paye: 'N',

    // primes variables
    exceptionelle: 'O',
    gratifications: 'P',
    fonction: 'Q',
    rendements: 'R',

    alloc_fam: 'S',
    salaire_brut: 'T',

    // cotisations
    cnaps: 'U',
    ostie: 'V',

    salaire_imposable: 'W',
    personne_a_charge: 'X',
    avance_salaire: 'Y',
    irsa: 'Z',
    reajustement: 'AA',
    total_retenues: 'AB',
    renumeration_dues: 'AC',
    mode_paiement: 'AD',
    observation: 'AE',
    observation2: 'AF',

    total_maj_nuit: 'AG',
    total_maj_weekend: 'AH',
    total_maj_ferie: 'AI',
    total_maj_heure_suppl_130: 'AJ',
    total_maj_heure_suppl_150: 'AK',

    // employee infos
    usuel: 'AL',
    m_code: 'AM',
    numbering: 'AN',
    matricule_cnaps: 'AO',
    cin: 'AP',
    embauche: 'AQ',
    adresse: 'AR',
    ordre: 'AS'
};

// Helper to create regex for finding employees
const reg = (value) => new RegExp(`^${value}$`, 'i');

async function generateReport(filePath, outFileName, data = []) {
    const workbook = new ExcelJS.Workbook();

    // Load the workbook
    await workbook.xlsx.readFile(filePath);

    // Get the target sheet (assuming the fourth sheet)
    const sheet = workbook.worksheets[3];

    // Determine row count
    const rowCount = sheet.rowCount;


    // Loop through rows starting at row 10
    let startIndex = 10, endRowIndex = 0;
    for (let rowIndex = startIndex; rowIndex <= rowCount; rowIndex++) {
        const row = sheet.getRow(rowIndex);

        // Read cell values
        const nom = row.getCell(ColumnName.nom).value;
        if (!nom) {
            endRowIndex = rowIndex;
            break;
        };

        const m_code = row.getCell(ColumnName.m_code).value;
        const numbering = row.getCell(ColumnName.numbering).value;

        // Find employee by M-CODE and Numbering
        const employee = data.find(
            (d) => reg(d.m_code).test(m_code) || reg(d.numbering).test(numbering)
        );

        if (employee) {
            // Update Transport and Repas columns
            row.getCell(ColumnName.transport).value = employee.transport || 0;
            row.getCell(ColumnName.repas).value = employee.repas || 0;
            // coller le salaire correspondant:
            row.getCell(ColumnName.salaire_correspondant).value = employee.salaire_correspondant || 0;

            // ADD Other if needed

        }

        // Commit the row changes
        row.commit();
    }


    // useful variables
    const {
        salaire_base, salaire_correspondant, rendements, salaire_brut, cnaps, ostie, avance_salaire, salaire_imposable,
        irsa, personne_a_charge, reajustement, total_retenues, renumeration_dues,
        heure_suppl_30, heure_suppl_50, heure_suppl_100, heure_suppl_130, heure_suppl_150,
        total_maj_nuit, total_maj_weekend, total_maj_ferie, total_maj_heure_suppl_130, total_maj_heure_suppl_150
    } = ColumnName;

    /**
     * ----------------------------------------------------------------------------------------------------------------------
     * TOTAL FORMULAS
     * ----------------------------------------------------------------------------------------------------------------------
    */
    const endRow = sheet.getRow(endRowIndex);
    // reusable func for creating SUM formula 
    const formulaSUM = (col) => `SUM(${col + startIndex}:${col + (endRowIndex - 1)})`;
    // reusable func for add formula to a cell
    const addFormulaSUMTo = (col) => endRow.getCell(col).value = { formula: formulaSUM(col) };

    // Heures supplémentaires
    [
        ColumnName.salaire_base, ColumnName.avance_salaire,
        ColumnName.salaire_brut, ColumnName.salaire_correspondant,
        ColumnName.preavis, ColumnName.conge_paye,
        ColumnName.cnaps, ColumnName.ostie,
        ColumnName.exceptionelle, ColumnName.fonction,
        ColumnName.gratifications, ColumnName.salaire_imposable,
        ColumnName.renumeration_dues, ColumnName.reajustement,
        ColumnName.transport, ColumnName.repas,
        ColumnName.heure_suppl_30, ColumnName.heure_suppl_50,
        ColumnName.heure_suppl_100, ColumnName.heure_suppl_130,
        ColumnName.heure_suppl_150,
    ].map(col => {
        // add formula SUM (somme) to these columns
        addFormulaSUMTo(col);
    });



    /**
     * ----------------------------------------------------------------------------------------------------------------------
     * FORMULAS FOR REPEATED COLUMNS
     * Using loop through from startIndex to endRowIndex
     * ----------------------------------------------------------------------------------------------------------------------
     */
    // loop
    for (let i = startIndex; i <= endRowIndex; i++) {

        // get row each line
        const row = sheet.getRow(i);
        const cell = (col) => col + i; // cell(A) = A + i

        /**
         * FORMULAS pour le salaire brut
         * Formula ex: SOMME(E11:R11)
         * @E : salaire correspondant
         * @R : rendements
         */
        const formulaBrut = `SUM(${cell(salaire_correspondant)}:${cell(rendements)})`;
        row.getCell(salaire_brut).value = { formula: formulaBrut };


        /**
         * CNAPS & OSTIE Formula
         * Formula ex:
         * FR version: SI(T49<=0;0;SI(T49*1%<=262680*8*1%;T49*1%;262680*8*1%))
         * EN version: IF(T49<=0,0,IF(T49*1%<=262680*8*1%,T49*1%,262680*8*1%))
         * @T : salaire brut
         */
        const formulaOstie_Cnaps = `IF(${cell(salaire_brut)}<=0,0,IF(${cell(salaire_brut)}*${TAUX_DE_RETENUE_CNAPS}<=${PLAFOND_SALARIAL}*${DUREE_PLAFONNEE}*${TAUX_DE_RETENUE_CNAPS},${cell(salaire_brut)}*${TAUX_DE_RETENUE_CNAPS},${PLAFOND_SALARIAL}*${DUREE_PLAFONNEE}*${TAUX_DE_RETENUE_CNAPS}))`;
        row.getCell(cnaps).value = row.getCell(ostie).value = { formula: formulaOstie_Cnaps };


        /**
         * SALAIRE IMPOSABLE
         * Formula ex: T12-U12-V12
         * @T : salaire brut
         * @U : cnaps
         * @V : ostie
         */
        const formulaImposable = `${cell(salaire_brut)}-${cell(cnaps)}-${cell(ostie)}`;
        row.getCell(salaire_imposable).value = { formula: formulaImposable };


        /**
         * IRSA
         * Formula ex: MAX(3000;0+MIN(MAX(0;W10-350000);50000)*5%+MIN(MAX(0;W10-400000);100000)*10%+MIN(MAX(0;W10-500000);100000)*15%+MAX(0;W10-600000)*20%-X10)
         * @W : salaire impossable
         * @X : persone à charge
         */
        const formulaIRSA = `MAX(3000,0+MIN(MAX(0,${cell(salaire_imposable)}-350000),50000)*5%+MIN(MAX(0,${cell(salaire_imposable)}-400000),100000)*10%+MIN(MAX(0,${cell(salaire_imposable)}-500000),100000)*15%+MAX(0,${cell(salaire_imposable)}-600000)*20%-${cell(personne_a_charge)})`
        row.getCell(irsa).value = { formula: formulaIRSA };

        /**
         * Total Retenues
         * Formula ex: Y135+U135+V135+Z135+AA135
         * @Y : avance salaire
         * @U : cnaps
         * @V : ostie
         * @Z : irsa
         * @AA : reajustement
         */
        const formulaRetenue = `${cell(avance_salaire)}+${cell(cnaps)}+${cell(ostie)}+${cell(irsa)}+${cell(reajustement)}`;
        row.getCell(total_retenues).value = { formula: formulaRetenue };


        /**
         * Rénumeration Dues
         * Formula ex:
         * FR version: ARRONDI(PLANCHER.XCL(T138-AB138;0,01);-2)
         * EN version: ROUND(FLOOR.XCL(T138-AB138, 0.01), -2)
         * @T : salaire brut
         * @AB : total retenues
         */
        const formulaRenumeration = `ROUND(FLOOR(${cell(salaire_brut)}-${cell(total_retenues)},0.01), -2)`;
        row.getCell(renumeration_dues).value = { formula: formulaRenumeration };


        /**
         * Heures supplémentaires
         * Formula ex:
         * 30% => F$7*AG23
         * 50% => G$7*AH23
         * 100% => H$7*AI23
         * 130% => I$7*AJ23
         * 150% => J$7*AK23
         * 
         */
        [
            {
                suppl: heure_suppl_30,
                total: total_maj_nuit, // 30%
            }, {
                suppl: heure_suppl_50,
                total: total_maj_weekend, // 50%
            }, {
                suppl: heure_suppl_100,
                total: total_maj_ferie, // 100%
            }, {
                suppl: total_maj_heure_suppl_130, // 130%
                total: heure_suppl_130,
            }, {
                suppl: heure_suppl_150,
                total: total_maj_heure_suppl_150 // 150%
            }
        ].map((item) => {
            const formula = `${item.suppl}$7*${cell(item.total)}`;
            row.getCell(item.suppl).value = { formula };
        });

    }


    // Write the updated workbook to a new file
    await workbook.xlsx.writeFile(outFileName);

    return outFileName;
}


// FOR GSS SHEET

/**
 * TODO
 * Extract:
 * - Transport and Repas
 * - Heures supplémentaires 30% 50% 100% 130% 150%
 * - Salaires correspondant
 * - Rendements
 * - Remarks ou comments
 * - Total
 */

const GSS_Columns = {
    sheet1: {
        numbering: 'A',
        m_code: 'B',
        transport: 'O',
        repas: 'P',
        compensation: 'Q',
        total: 'T',
        heure_suppl_30: 'U',
        heure_suppl_50: 'V',
        heure_suppl_100: 'W',
        heure_suppl_130: 'X',
        heure_suppl_150: 'Y',
        bonus: 'Z',
        total2: 'AA',
        salaire_correspondant: 'AB',
        rendement: 'AC',
        observation: 'AD',
        maternity_allaitement_perm: 'Q',
    },
    sheet2: {
        numbering: 'A',
        m_code: 'B',
        transport: 'R',
        repas: 'S',
        compensation: 'T',
        total: 'W',
        heure_suppl_30: 'X',
        heure_suppl_50: 'Y',
        heure_suppl_100: 'Z',
        heure_suppl_130: 'AA',
        heure_suppl_150: 'AB',
        bonus: 'AC',
        total2: 'AD',
        salaire_correspondant: 'AE',
        rendement: 'AF',
        observation: 'AG',
        maternity_allaitement_perm: 'U',
    },
    sheet3: {
        numbering: 'A',
        m_code: 'B',
        transport: 'AB',
        repas: 'AC',
        compensation: 'AD',
        total: 'AG',
        heure_suppl_30: 'AH',
        heure_suppl_50: 'AI',
        heure_suppl_100: 'AJ',
        heure_suppl_130: 'AK',
        heure_suppl_150: 'AL',
        bonus: 'AM',
        total2: 'AN',
        salaire_correspondant: 'AO',
        rendement: 'AP',
        observation: 'AQ',
        maternity_allaitement_perm: 'AE',
    },
    sheet4: {
        numbering: 'A',
        m_code: 'B',
        transport: 'P',
        repas: 'Q',
        compensation: 'S',
        total: 'V',
        heure_suppl_30: 'W',
        heure_suppl_50: 'X',
        heure_suppl_100: 'Y',
        heure_suppl_130: 'Z',
        heure_suppl_150: 'AA',
        bonus: 'AB',
        total2: 'AC',
        salaire_correspondant: 'AD',
        rendement: 'AE',
        observation: 'AF',
        maternity_allaitement_perm: 'R',
    },
    sheet5: {
        numbering: 'A',
        m_code: 'B',
        transport: 'P',
        repas: 'Q',
        compensation: 'S',
        total: 'U',
        heure_suppl_30: 'V',
        heure_suppl_50: 'W',
        heure_suppl_100: 'X',
        heure_suppl_130: 'Y',
        heure_suppl_150: 'Z',
        bonus: 'AA',
        total2: 'AB',
        salaire_correspondant: 'AC',
        rendement: 'AD',
        observation: 'AE',
        maternity_allaitement_perm: 'R',
    },
    sheet6: {
        numbering: 'A',
        m_code: 'B',
        transport: 'L',
        repas: 'M',
        compensation: 'O',
        total: 'P',
        heure_suppl_30: 'Q',
        heure_suppl_50: 'R',
        heure_suppl_100: 'S',
        heure_suppl_130: 'T',
        heure_suppl_150: 'U',
        bonus: 'V',
        total2: 'W',
        salaire_correspondant: 'X',
        rendement: 'Y',
        observation: 'Z',
        maternity_allaitement_perm: 'N',
    },
    sheet7: {
        numbering: 'A',
        m_code: 'B',
        transport: 'N',
        repas: 'O',
        compensation: 'O',
        total: 'S',
        heure_suppl_30: 'T',
        heure_suppl_50: 'U',
        heure_suppl_100: 'V',
        heure_suppl_130: 'W',
        heure_suppl_150: 'X',
        bonus: 'Y',
        total2: 'Z',
        salaire_correspondant: 'AA',
        rendement: 'AB',
        observation: 'AC',
        maternity_allaitement_perm: 'P',
    },
    sheet8: {
        numbering: 'A',
        m_code: 'A',
        transport: 'F',
        repas: 'G',
        // compensation: 'O',
        total: 'I',
        heure_suppl_30: 'J',
        heure_suppl_50: 'K',
        heure_suppl_100: 'L',
        heure_suppl_130: 'M',
        heure_suppl_150: 'N',
        bonus: 'O',
        total2: 'P',
        salaire_correspondant: 'Q',
        rendement: 'R',
        observation: 'S',
        maternity_allaitement_perm: 'H',
    },
    sheet9: {
        numbering: 'A',
        m_code: 'B',
        transport: 'I',
        repas: 'J',
        compensation: 'L',
        total: 'N',
        heure_suppl_30: 'O',
        heure_suppl_50: 'P',
        heure_suppl_100: 'Q',
        heure_suppl_130: 'R',
        heure_suppl_150: 'S',
        bonus: 'T',
        total2: 'U',
        salaire_correspondant: 'V',
        rendement: 'W',
        observation: 'X',
        maternity_allaitement_perm: 'K',
    },
    sheet10: {
        numbering: 'A',
        m_code: 'B',
        transport: 'L',
        repas: 'M',
        compensation: 'O',
        total: 'Q',
        heure_suppl_30: 'R',
        heure_suppl_50: 'S',
        heure_suppl_100: 'T',
        heure_suppl_130: 'U',
        heure_suppl_150: 'V',
        bonus: 'W',
        total2: 'X',
        salaire_correspondant: 'Y',
        rendement: 'Z',
        observation: 'AA',
        maternity_allaitement_perm: 'N',
    },
};

async function extractDataInGSS(gssPath) {

    const wb = XLSX.readFile(gssPath);

    const data = [];

    // loop through sheets
    for (let i = 0; i < wb.SheetNames.length; i++) {

        const sheetName = wb.SheetNames[i];
        const sheet = wb.Sheets[sheetName];

        // Get the range of the sheet
        const range = XLSX.utils.decode_range(sheet['!ref']);
        // Extract row and column counts
        const rowCount = range.e.r - range.s.r + 1; // End row - Start row + 1

        // loop through rows
        for (let j = 5; j <= rowCount; j++) {

            if (!sheet[GSS_Columns[`sheet${i + 1}`].m_code + j]) {
                if (j > 5) break;
                continue;
            }

            const rowData = {};
            Object.entries(GSS_Columns[`sheet${i + 1}`]).map(([key, value]) => {
                rowData[key] = sheet[value + j]?.v;
            });

            data.push(rowData);
        }
    }

    return data;

}


/**
 * Method to generate FP in excel
 * 
 */
async function generateFP() {
    const workbook = new ExcelJS.Workbook();

    // Load the workbook
    await workbook.xlsx.readFile('./template.xlsx');

    // get data from EMEMENT DE PAIE
    const sheet = workbook.worksheets[3];
    const rowCount = sheet.rowCount;


    // Loop through rows starting at row 10
    let startIndex = 10;
    const paieData = [];
    for (let rowIndex = startIndex; rowIndex <= rowCount; rowIndex++) {
        if (!sheet.getCell('A' + rowIndex).value) break;

        let data = {};
        Object.entries(ColumnName).map(([key, value]) => {
            data[key] = sheet.getCell(value + rowIndex).value;
        });

        paieData.push(data)
    }

    const worksheet = workbook.worksheets[4];
    const sourceStartCol = 1; // 'A'
    const sourceEndCol = 6;   // 'F'
    const sourceStartRow = 1;
    const sourceEndRow = 55;  // Adjust this to the last row of the data block

    const duplicateCount = paieData.length; // Total number of duplications to make
    const duplicatePerRow = 2; // Number of duplicates per row in each batch
    const rowGap = 2; // Gap of two rows
    const colGap = 1; // Gap of one column

    // Loop to duplicate data
    for (let batch = 0; batch < duplicateCount; batch++) {
        const rowOffset = Math.floor(batch / duplicatePerRow) * (sourceEndRow - sourceStartRow + 1 + rowGap);
        const colOffset = (batch % duplicatePerRow) * (sourceEndCol - sourceStartCol + 1 + colGap);

        // Add logo at the starting cell of each duplicated block
        addLogo(workbook, worksheet, colOffset, rowOffset);

        // Copy merged cells
        Object.keys(worksheet._merges).forEach((mergeKey) => {
            const merge = worksheet._merges[mergeKey];
            const { top, left, bottom, right } = merge;
            if (top >= sourceStartRow && bottom <= sourceEndRow && left >= sourceStartCol && right <= sourceEndCol) {
                const targetTop = top + rowOffset;
                const targetLeft = left + colOffset;
                const targetBottom = bottom + rowOffset;
                const targetRight = right + colOffset;

                // Check if the target cells are already merged
                const isAlreadyMerged = Object.values(worksheet._merges).some(
                    (existingMerge) =>
                        existingMerge.top === targetTop &&
                        existingMerge.left === targetLeft &&
                        existingMerge.bottom === targetBottom &&
                        existingMerge.right === targetRight
                );

                if (!isAlreadyMerged) {
                    worksheet.mergeCells(targetTop, targetLeft, targetBottom, targetRight);
                }
            }
        });

        // Copy individual cells
        for (let row = sourceStartRow; row <= sourceEndRow; row++) {
            for (let col = sourceStartCol; col <= sourceEndCol; col++) {
                const cell = worksheet.getCell(row, col);
                const targetCell = worksheet.getCell(row + rowOffset, col + colOffset);
                targetCell.value = cell.value;
                targetCell.style = { ...cell.style }; // Copy styles
            }
        }

        // Copy column widths
        for (let col = sourceStartCol; col <= sourceEndCol; col++) {
            const sourceColumn = worksheet.getColumn(col);
            const targetColumn = worksheet.getColumn(col + colOffset);
            targetColumn.width = sourceColumn.width;
        }
    }

    // After duplication, update the cells containing {M_CODE}
    for (let batch = 0; batch < duplicateCount; batch++) {
        const rowOffset = Math.floor(batch / duplicatePerRow) * (sourceEndRow - sourceStartRow + 1 + rowGap);
        const colOffset = (batch % duplicatePerRow) * (sourceEndCol - sourceStartCol + 1 + colGap);

        // Find cell by value within the specific range of the duplicated block
        const cellAddress = (key) => findCellByValueInRange(worksheet, key, sourceStartRow + rowOffset, sourceEndRow + rowOffset, sourceStartCol + colOffset, sourceEndCol + colOffset);

        // Create a formula to link to the corresponding cell in the ETAT DE PAIE sheet
        const createLinkFormula = (cell) => `'${sheet.name}'!${cell}${startIndex + batch}`;

        // Find the cell containing {M_CODE} and update it with a formula
        // cells to link
        const cellsToLink = ['nom', 'm_code', 'matricule', 'adresse', 'usuel', 'embauche', 'matricule_cnaps', 'cin',];
        cellsToLink.map(cell => {
            const address = cellAddress(`{${cell.toUpperCase()}}`);
            if (address) {
                const cellRef = worksheet.getCell(address);
                if (typeof cellRef.value === 'string') {
                    cellRef.value = { formula: createLinkFormula(ColumnName[cell]) };
                }
            }
        });

    }

    await workbook.xlsx.writeFile('./output.xlsx');
    console.log('done!');
}

function addLogo(wb, ws, colOffset, rowOffset) {
    // Add the image to the workbook
    const imageId = wb.addImage({
        filename: './public/images/logo.jpg', // Replace with your image file path
        extension: 'png',
    });

    // Convert cm to pixels (ExcelJS uses pixels for positioning)
    const cmToPx = (cm) => cm * 37.795276; // 1 cm = 37.795276 pixels

    const positionX = cmToPx(0.03); // Convert Position X to pixels
    const positionY = cmToPx(0.00); // Convert Position Y to pixels
    const width = cmToPx(5.63); // Convert Width to pixels
    const height = cmToPx(0.90); // Convert Height to pixels

    // Position and size the image
    ws.addImage(imageId, {
        tl: { col: colOffset, row: rowOffset, nativeX: positionX, nativeY: positionY }, // Top-left corner with fine-tuning
        ext: { width, height }, // Width and height in pixels
    });
}


/**
 * Function to find a cell by its value containing the specified key within a specific range
 * @param {Worksheet} worksheet - The worksheet to search in
 * @param {string} key - The key to search for within cell values
 * @param {number} startRow - The starting row of the range
 * @param {number} endRow - The ending row of the range
 * @param {number} startCol - The starting column of the range
 * @param {number} endCol - The ending column of the range
 * @returns {string} - The cell address (e.g., 'A1') or null if not found
 */
function findCellByValueInRange(worksheet, key, startRow, endRow, startCol, endCol) {
    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
            const cell = row.getCell(colIndex);
            if (typeof cell.value === 'string' && cell.value.includes(key)) {
                return cell.address;
            } else if (cell.value && cell.value.richText) {
                for (const part of cell.value.richText) {
                    if (part.text.includes(key)) {
                        return cell.address;
                    }
                }
            }
        }
    }
    return null;
}

// generateFP();

module.exports = {
    extractDataInGSS,
    generateReport,
    findCellByValueInRange
}
