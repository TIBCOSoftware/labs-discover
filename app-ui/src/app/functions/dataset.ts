


// previewColumn is the object array for displaying data preview
export function calculateDatasetColumns (columns: string[]): any[] {
  return columns.map(column => {
    const newColumn = {
      headerName: column,
      field: column,
      sortable: false,
      filter: false,
      resizable: false
    };
    return newColumn;
  })
}

export function calculateDatasetData (columns: any[], data: any[]): any[] {
  const returnData = [];
  data.forEach(element => {
    const row = {};
    for (let index = 0; index < columns.length; index++) {
      row[columns[index]] = element[index];
    }
    returnData.push(row)
  });
  return returnData;
}
