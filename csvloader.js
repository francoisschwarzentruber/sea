/**
 * read the CSV and returns the array
 */
export class CSVLoader {
    static arrayFromFile(filename) {
        return new Promise((resolve, reject) =>
            fetch(filename).then((value) => value.text().then((txt) => resolve(CSVStringToArray(txt)))));
    }
}



/**
 * input: a CSV string (separator is ; for columns and \n for rows)
 * output: corresponding array A[y][x]
 */
function CSVStringToArray(str) {
    return str.split("\n").map((line) => line.split(";"));
}
