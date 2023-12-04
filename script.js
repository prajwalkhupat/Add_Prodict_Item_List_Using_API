let itemList = []; // Local copy of item list

        async function addItem() {
            var itemName = document.getElementById('itemName').value;
            var itemDescription = document.getElementById('itemDescription').value;
            var itemPrice = document.getElementById('itemPrice').value;
            var itemQuantity = document.getElementById('itemQuantity').value;

            if (!itemName || !itemDescription || !itemPrice || !itemQuantity) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const response = await axios.post('https://crudcrud.com/api/54a7cf444a7d4de4910b62ce9ef5efd9/items', {
                    itemName,
                    itemDescription,
                    itemPrice,
                    itemQuantity
                });

                // Add the new item to the local copy
                itemList.push(response.data);

                // Update the UI with the local item list
                updateUI(itemList);
            } catch (error) {
                console.error('Error adding item:', error);
            }

            document.getElementById('itemName').value = '';
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemPrice').value = '';
            document.getElementById('itemQuantity').value = '';
        }

        async function updateUI(itemList) {
            var itemListElement = document.getElementById('itemList');
            itemListElement.innerHTML = '';

            itemList.forEach(item => {
                var newItem = document.createElement('li');
                newItem.className = 'item';
                newItem.innerHTML = `
                    <strong>Name:</strong> ${item.itemName}
                    <strong>Description:</strong> ${item.itemDescription}
                    <strong>Price:</strong> ${item.itemPrice}
                    <strong>Quantity:</strong> <span id="${item._id}-quantity">${item.itemQuantity}</span>
                    <button class="buyButton" onclick="buyItem('${item._id}', 1)">Buy1</button>
                    <button class="buyButton" onclick="buyItem('${item._id}', 2)">Buy2</button>
                    <button class="buyButton" onclick="buyItem('${item._id}', 3)">Buy3</button>
                `;
                itemListElement.appendChild(newItem);
            });
        }

        async function buyItem(itemId, quantityToBuy) {
            try {
                // Find the item in the local copy
                const itemIndex = itemList.findIndex(item => item._id === itemId);
                if (itemIndex !== -1) {
                    const item = itemList[itemIndex];

                    // Calculate the new quantity after a purchase
                    var newQuantity = Math.max(item.itemQuantity - quantityToBuy, 0);

                    // Update the item quantity in the local copy
                    itemList[itemIndex].itemQuantity = newQuantity;

                    // Update the item quantity in the CRUD API and UI in parallel
                    await Promise.all([
                        updateAPI(itemId, { itemQuantity: newQuantity,itemName:item.itemName,itemDescription:item.itemDescription,itemPrice:item.itemPrice}),
                        updateUI(itemList),
                    ]);
                }
            } catch (error) {
                console.error('Error updating item quantity:', error);
            }
        }

        async function updateAPI(itemId, data) {
            try {
                // Update the item quantity in the CRUD API
                const response = await axios.put(`https://crudcrud.com/api/54a7cf444a7d4de4910b62ce9ef5efd9/items/${itemId}`, data);

                // Check if the API update was successful
                if (response.status === 200) {
                    console.log('API updated successfully');
                } else {
                    console.error('Error updating API:', response.statusText);
                }
            } catch (error) {
                console.error('Error updating API:', error);
                throw error; // Re-throw the error to be caught by the calling function
            }
        }

        window.onload = async function () {
            try {
                // Fetch the initial item list from the CRUD API
                const itemListResponse = await axios.get('https://crudcrud.com/api/54a7cf444a7d4de4910b62ce9ef5efd9/items');
                itemList = itemListResponse.data;

                // Update the UI with the initial item list
                updateUI(itemList);
            } catch (error) {
                console.error('Error fetching item list:', error);
            }
        };