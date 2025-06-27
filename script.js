document.getElementById('fuelForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const date = document.getElementById('date').value;
    const distance = document.getElementById('distance').value;
    const fuelConsumed = document.getElementById('fuelConsumed').value;

    // Create a new row in the table
    const table = document.getElementById('fuelData').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.insertCell(0).textContent = date;
    newRow.insertCell(1).textContent = distance;
    newRow.insertCell(2).textContent = fuelConsumed;

    // Clear the form
    document.getElementById('fuelForm').reset();
});