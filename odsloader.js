/**
 * reader for ODS files (LibreOffice.Calc)
 */
export class ODSLoader {
    /**
 * read the ODS file and returns the data  { content: array of the content, style:array of the background color };
 */
    static dataFromFile(filename) {
        return new Promise((resolve, reject) =>
            fetch(filename).then((value) => value.blob())
                .then(async (blob) => {
                    const reader = new zip.ZipReader(new zip.BlobReader(blob));
                    const entries = await reader.getEntries();
                    for (let i = 0; i < entries.length; i++) {
                        const entry = entries[i];
                        if (entry.filename == "content.xml") {
                            const text = await entry.getData(
                                new zip.TextWriter(),
                                {
                                    onprogress: (index, max) => {
                                        // onprogress callback
                                    }
                                }
                            );
                            // text contains the entry data as a String

                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(text, "text/xml");
                            resolve(XMLToData(xmlDoc));
                        }

                    }
                    reject();

                }));
    }
}

/**
 * 
 * @param {*} xmlDoc 
 * @returns returns the dictionnary containing pairs (styleName, styleXMLelement)
 */
function XMLgetStyles(xmlDoc) {
    const styles = {};
    const stylesXML = xmlDoc.querySelectorAll("style");
    stylesXML.forEach((styleXML) => {
        styles[styleXML.getAttribute("style:name")] = styleXML;
    })
    return styles;
}


/**
 * 
 * @param {*} xmlDoc 
 * @returns an array columnStyle such that columnStyles[i] is the standard style name of column i
 */
function getColumnStandardStyles(xmlDoc) {
    const cols = xmlDoc.querySelectorAll("table-column");
    const columnStyles = [];
    cols.forEach((col) => {
        const m = col.getAttribute("table:number-columns-repeated") ? parseInt(col.getAttribute("table:number-columns-repeated")) : 1;
        for (let i = 1; i <= m; i++) {
            columnStyles.push(col.getAttribute("table:default-cell-style-name"));

        }
    });
    return columnStyles;
}


/**
 * 
 * @param {*} xmlDoc 
 * @returns 
 */
function XMLToData(xmlDoc) {
    const styles = XMLgetStyles(xmlDoc);
    const columnStyles = getColumnStandardStyles(xmlDoc);
    console.log("column styles:");
    console.log(columnStyles)
    const rows = xmlDoc.querySelectorAll("table-row");
    const array = new Array();
    const styleArray = new Array();
    let y = 0;
    rows.forEach((row, y) => {
        const m = row.getAttribute("table:number-rows-repeated") ? parseInt(row.getAttribute("table:number-rows-repeated")) : 1;
        for (let i = 1; i <= m; i++) {
            let x = 0;
            const cells = row.querySelectorAll("table-cell");
            const arrayRow = new Array(); //number-columns-repeated
            const styleArrayRow = new Array();

            cells.forEach((cell) => {
                const n = cell.getAttribute("table:number-columns-repeated") ? parseInt(cell.getAttribute("table:number-columns-repeated")) : 1;
                for (let j = 1; j <= n; j++) {
                    let styleName = cell.getAttribute("table:style-name");
                    if (styleName == undefined)
                        styleName = columnStyles[x];
                    try {
                        styleArrayRow.push(extractColorFromStyle(styles[styleName]));
                        arrayRow.push(cell.querySelector("p") ? cell.querySelector("p").firstChild.data : "");
                    }
                    catch {
                        console.log("style " + styleName + " not found");
                        console.log(styles[cell.getAttribute("table:style-name")])
                        throw "error"
                    }
                    x++;

                }
            });
            array.push(arrayRow);
            styleArray.push(styleArrayRow);

            y++;
        }
    });
    return { content: array, style: styleArray };
}

/**
 * 
 * @param {*} style (XML element)
 * @returns get the background color
 */
function extractColorFromStyle(style) {
    if (style == undefined)
        return undefined;

    if (style == "Default")
        return undefined;

    try {
        return style.firstChild.getAttribute("fo:background-color");
    }
    catch {
        return style.nextElementSibling.getAttribute("fo:background-color");

    }
}
