'use client'
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import { firestore } from "../firebase";
import { collection, doc, getDocs, query, setDoc, deleteDoc, count } from "firebase/firestore";
import { useEffect, useState } from "react";

// Modal style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  // Modal state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // Searching for items within modal
  const [itemname, setItemName] = useState('');
  // useEffect to get all the pantry items from firestore
  const updatePantries = async () => {
    //create a query to get all the documents in the pantry collection
    const snapshot = query(collection(firestore, 'pantry'));
    //get all the documents in the pantry collection
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach(doc => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);
  }
  useEffect(() => {

    updatePantries();
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDocs(docRef);
    //if the document already exists, update the count
    if (docSnap.exists()) {
      const count = docSnap.data().count + 1;
      await setDoc(docRef, { count });
    }
    else {
      //if the document does not exist, create a new document with the item name and count 1
      await setDoc(docRef, { count: 1 });

    }
    await updatePantries();
  }

  const removeItem = async (item) => {
    //delete the document with the item name
    const docRef = doc(collection(firestore, 'pantry'), item);
    await deleteDoc(docRef);
    await updatePantries();
  }
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <TextField id="outlined-basic" label="item" variant="outlined" fullWidth
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant={"contained"} color={"primary"}
              onClick={() => {
                addItem(itemname)
                setItemName("")
                handleClose()
              }

              }>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant={"contained"} color={"primary"} onClick={handleOpen}>Add</Button>

      <Box border={'1px solid #333'}>
        <Box width={"800px"} height={"100px"} bgcolor={"#ADD8E6"} display={"flex"}
          justifyContent={"center"} alignItems={"center"}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={'center'}>
            Pantry Items
          </Typography>

        </Box>
        <Stack
          width={'800px'}
          height={'300px'}
          spacing={2}
          overflow={'scroll'}
        >
          {
            pantry.map(({ name, count }) => (
              <Box
                key={name}
                width={'100%'}
                minHeight={'150px'}
                bgcolor={'#f0f0f0'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                paddingX={5}
              >
                <Typography
                  variant={"h3"}
                  color={"#333"}
                  textAlign={'center'}>
                  {
                    // Capitalize the first letter fo the item
                    name.charAt(0).toUpperCase() + name.slice(1)
                  }
                </Typography>
                <Typography
                  variant={"h3"}
                  color={"#333"}
                  textAlign={'center'}>
                  Quantity: {count}</Typography>
                <Button variant={"contained"} color={"error"} onClick={() => removeItem(name)} size="small" >Remove</Button>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}
