const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
// variables
// const PLAFOND_SALARIAL = 262680;
const DUREE_PLAFONNEE = 8;
const TAUX_DE_RETENUE_CNAPS = '1%';

const { 
    getAllColumns,
} = require('../controllers/template/template_controlleur');

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
    remboursement: 'AA',
    reajustement: 'AB',
    total_retenues: 'AC',
    renumeration_dues: 'AD',
    mode_paiement: 'AE',
    observation: 'AF',
    observation2: 'AG',

    total_maj_nuit: 'AH',
    total_maj_weekend: 'AI',
    total_maj_ferie: 'AJ',
    total_maj_heure_suppl_130: 'AK',
    total_maj_heure_suppl_150: 'AL',

    // employee infos
    usuel: 'AM',
    m_code: 'AN',
    numbering: 'AO',
    matricule_cnaps: 'AP',
    cin: 'AQ',
    embauche: 'AR',
    adresse: 'AS',
    ordre: 'AT'
};


const MajorationColumns = {
    nom: 'A',
    m_code: 'B',
    total_maj_nuit: 'C',
    total_maj_weekend: 'D',
    total_maj_ferie: 'E',
    total_maj_heure_suppl_130: 'F',
    total_maj_heure_suppl_150: 'G',
}

//Helper to create regex for finding employees

const reg = (value) => new RegExp(`^${value}$`, 'i');

async function generateReport(filePath, outFileName, data = [], variable = {}) {
    
    const workbook = new ExcelJS.Workbook();

    const PLAFOND_SALARIAL = parseInt(variable.plafondCnaps);
    
    // Load the workbook
    await workbook.xlsx.readFile(filePath);

    // Get the target sheet (assuming the fourth sheet)
    const sheet = workbook.worksheets[1];  // 3

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
            row.getCell(ColumnName.total_maj_nuit).value = employee.total_maj_nuit;
            row.getCell(ColumnName.total_maj_weekend).value = employee.total_maj_weekend;
            row.getCell(ColumnName.total_maj_ferie).value = employee.total_maj_ferie;
            row.getCell(ColumnName.total_maj_heure_suppl_130).value = employee.total_maj_heure_suppl_130;
            row.getCell(ColumnName.total_maj_heure_suppl_150).value = employee.total_maj_heure_suppl_150;
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
         * IRSA (alaina avy @ FPOptionModel.formula fa avy eto efa passé ao amin'ny argument 'variable')
         * Formula ex: MAX(3000;0+MIN(MAX(0;W10-350000);50000)*5%+MIN(MAX(0;W10-400000);100000)*10%+MIN(MAX(0;W10-500000);100000)*15%+MAX(0;W10-600000)*20%-X10)
         * @W : salaire impossable
         * @X : persone à charge
         */
        const formulaIRSA = variable.formula.replace(/W10/g, `${cell(salaire_imposable)}`).replace(/X10/g, `${cell(personne_a_charge)}`).replace(/;/g, ',');
        row.getCell(irsa).value = { formula: formulaIRSA.slice(1) };

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
            // row.getCell(item.suppl).value = { formula };
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

var GSS_Columns 

async function extractDataInGSS(gssPath) {

    var getCol = await getAllColumns(); // Initialise la variable globale
    // Conversion vers l'objet GSS_Columns
    GSS_Columns = getCol.reduce((acc, item) => {
        acc[item.sheetName] = Object.fromEntries(item.columns);
        return acc;
    }, {});
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

            
            if (!sheet[GSS_Columns[sheetName].m_code + j]) {
                if (j > 5) break;
                continue;
            }

            const rowData = {};
            Object.entries(GSS_Columns[sheetName]).map(([key, value]) => {
                rowData[key] = sheet[value + j]?.v;
            });

            data.push(rowData);
        }
    }

    return data;

}


/**
 * Method to extract data in majoration file
 * to get Heure supplémentaires
 */

async function extractDataInMajoration(path) {

    const wb = XLSX.readFile(path);

    const data = [];
    
    const sheetName = wb.SheetNames[0]; // first sheet (feuil)
    const sheet = wb.Sheets[sheetName];
    
    // Get the range of the sheet
    const range = XLSX.utils.decode_range(sheet['!ref']);
    // Extract row and column counts
    const rowCount = range.e.r - range.s.r + 1; // End row - Start row + 1

    // loop through rows
    for (let j = 4; j <= rowCount; j++) {

        if (!sheet[MajorationColumns.m_code + j]) {
            break;
        }

        const rowData = {};
        Object.entries(MajorationColumns).map(([key, value]) => {
            if (key !== 'm_code' || key !== 'nom') {
                let chiffre = parseFloat(sheet[value + j]?.v);
                rowData[key] = isNaN(chiffre) ? 0 : chiffre;
            }
        });

        data.push(rowData);
    }

    return data;
}


async function generateFP() {
    const workbook = new ExcelJS.Workbook();

    console.time('Loading workbook');
    await workbook.xlsx.readFile('./template.xlsx');
    console.timeEnd('Loading workbook');

    const sheet = workbook.worksheets[3];
    const rowCount = sheet.rowCount;

    console.time('Extracting data');
    let paieData = [];
    for (let rowIndex = 10; rowIndex <= rowCount; rowIndex++) {
        if (!sheet.getCell('A' + rowIndex).value) break;

        const data = {};
        Object.entries(ColumnName).forEach(([key, value]) => {
            data[key] = sheet.getCell(value + rowIndex).value;
        });

        paieData.push(data);
    }
    console.timeEnd('Extracting data');

    const worksheet = workbook.worksheets[4];
    const sourceRange = { startRow: 1, endRow: 55, startCol: 1, endCol: 6 };
    const duplicateCount = paieData.length;
    const duplicatePerRow = 2;
    const rowGap = 2;
    const colGap = 1;

    console.time('Duplicating blocks');
    for (let batch = 0; batch < duplicateCount; batch++) {
        const rowOffset = Math.floor(batch / duplicatePerRow) * (sourceRange.endRow - sourceRange.startRow + 1 + rowGap);
        const colOffset = (batch % duplicatePerRow) * (sourceRange.endCol - sourceRange.startCol + 1 + colGap);

        for (let row = sourceRange.startRow; row <= sourceRange.endRow; row++) {
            for (let col = sourceRange.startCol; col <= sourceRange.endCol; col++) {
                const cell = worksheet.getCell(row, col);
                const targetCell = worksheet.getCell(row + rowOffset, col + colOffset);
                targetCell.value = cell.value;
                targetCell.style = { ...cell.style };
            }
        }
    }
    console.timeEnd('Duplicating blocks');

    console.time('Writing output');
    await workbook.xlsx.writeFile('./output.xlsx');
    console.timeEnd('Writing output');

    console.log('Done!');
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


function mergeDataWithKey(data1, data2, key='') {
    // loop througn majoration data
    data2.map(item => {
        // find item m_code in gss data
        let search = data1.find(i => i[key] === item[key]);
        if (search) { // if found
            // update its value
            const { nom, m_code, ...rest } = item;
            Object.entries(rest).map(([k, v]) => {
                search[k] = v;
            });
        }
    });

    return data1;
}


module.exports = {
    extractDataInGSS,
    extractDataInMajoration,
    generateReport,
    findCellByValueInRange,
    mergeDataWithKey
}
