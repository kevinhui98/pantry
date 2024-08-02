'use client'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, MenuItem, FormControl, Select, InputLabel, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { firestore } from "../firebase";
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, where } from "firebase/firestore";
import { useEffect, useState, useRef, Fragment } from "react";
// import { Camera } from "./Camera";
import { Camera } from "react-camera-pro";
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
  // Add Modal state
  const [addOpen, setAddOpen] = useState(false);
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);
  // Search Modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const handleSearchOpen = () => setSearchOpen(true);
  const handleSearchClose = () => setSearchOpen(false);
  // Quantity state
  const [quantity, setQuantity] = useState(1);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const handleQuantityChange = (event) => setQuantity(event.target.value);
  const handleQuantityClose = () => setQuantityOpen(false);
  const handleQuantityOpen = () => setQuantityOpen(true);

  // Searching for items within modal
  const [itemname, setItemName] = useState('');
  const [catagory, setCatagory] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [saveImage, setSaveImage] = useState(null);
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
    console.log("pantryList", pantryList);
    setPantry(pantryList);
  }
  useEffect(() => {
    updatePantries();
  }, []);
  const addItem = async (cat, item, quantity, img) => {
    if (cat === "") cat = "pantry";
    const docRef = doc(collection(firestore, cat), item)
    const subCat = await getDoc(docRef);
    //if the document already exists, update the count
    if (subCat.exists()) {
      // console.log("subCat ", subCat.data());
      const name = subCat.data().name;
      if (img === null) img = subCat.data().image;
      const count = subCat.data().count + quantity;
      await setDoc(docRef, { name, count, catagory: cat, image: img });
    }
    else {
      //if the document does not exist, create a new document with the item name and count 1
      await setDoc(docRef, { name: item, count: quantity, catagory: cat, image: img });

    }
    await updatePantries();
  }

  const removeItem = async (item) => {
    //delete the document with the item name
    const docRef = doc(collection(firestore, 'pantry'), item);
    await deleteDoc(docRef);
    await updatePantries();
  }

  const search = async (item) => {
    //create a query to get the document with the item name
    const pantryref = collection(firestore, 'pantry')
    const q1 = query(pantryref, where('name', '==', item))
    // const q2 = query(pantryref, where('count', '==', count))
    const querySnapshot1 = await getDocs(q1);
    // const querySnapshot2 = await getDocs(q2);
    const pantryList = [];
    // querySnapshot1.forEach(doc => {
    //   pantryList.push({ name: doc.id, ...doc.data() });
    // });
    // querySnapshot2.forEach(doc => {
    //   pantryList.push({ name: doc.id, ...doc.data() });
    // });
    setPantry(pantryList);
    // const snapshot = query(collection(firestore, 'pantry'), or());
    // const docs = await getDocs(snapshot);
    // const pantryList = [];
    // docs.forEach(doc => {
    //   pantryList.push({ name: doc.id, ...doc.data() });
    // });
    // setPantry(pantryList);
  }
  function ChildModal() {
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    return (
      <Fragment>
        {saveImage !== null ? <img src={saveImage} alt='Taken photo' /> : null}
        <Button onClick={handleOpen}>Take Picture</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <Box sx={{ ...style }}>
            <CloseIcon onClick={handleClose} />
            {image === null ?
              <Stack direction={'column'} gap={2} >
                <Camera ref={camera} aspectRatio={4 / 3} />
                <Button variant={"contained"} color={"primary"} onClick={() => setImage(camera.current.takePhoto())}>Take photo</Button>
              </Stack> :
              <Stack direction={'column'} gap={2}>
                <img aspectRatio={4 / 3} src={image} alt='Taken photo' />
                <Button variant={"contained"} color={"primary"} onClick={() => { setImage(null); }}>retake</Button>
                <Button variant={"contained"} color={"primary"} onClick={() => { setSaveImage(image); }}>Save</Button>
              </Stack>
            }
          </Box>
        </Modal>
      </Fragment>
    );
  }
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}>
      <Modal
        open={addOpen}
        onClose={handleAddClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={"column"} spacing={2}>
            <TextField id="outlined-basic" label="pantry (optional)" variant="outlined" fullWidth
              onChange={(e) => setCatagory(e.target.value)} />
            <Stack direction={'row'} spacing={2}>
              <TextField id="outlined-basic" label="item" variant="outlined" fullWidth
                onChange={(e) => setItemName(e.target.value)} required />
              <FormControl sx={{ m: 1, minWidth: 120 }} >
                <InputLabel id="demo-controlled-open-select-label">Quantity</InputLabel>
                <Select
                  labelId="demo-controlled-open-select-label"
                  id="demo-controlled-open-select"
                  open={quantityOpen}
                  onClose={handleQuantityClose}
                  onOpen={handleQuantityOpen}
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value)
                    handleQuantityClose
                  }}>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <ChildModal />
            <Button variant={"contained"} color={"primary"}
              onClick={() => {
                addItem(catagory, itemname, quantity, saveImage)
                setCatagory("")
                setItemName("")
                setQuantity(1)
                setSaveImage(null)
                handleAddClose()
              }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={searchOpen}
        onClose={handleSearchClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Search Item
          </Typography>
          <Stack direction={"column"} spacing={2}>
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth
              onChange={(e) => setSearchItem(e.target.value)}
            />
            <Button variant={"contained"} color={"primary"}
              onClick={() => {
                search(searchItem)
                setSearchItem("")
                handleSearchClose()
              }

              }>Search</Button>
          </Stack>
        </Box>
      </Modal>
      <Box>
        <Stack direction={"row"} spacing={4}>
          <Button variant={"contained"} color={"primary"} onClick={handleAddOpen}>Add</Button>
          <Button variant={"contained"} color={"primary"}
            onClick={handleSearchOpen}>Search</Button>
        </Stack>
      </Box>
      <Box border={'1px solid #333'}>
        <Box width={"800px"} height={"100px"} bgcolor={"#ADD8E6"} display={"flex"}
          justifyContent={"center"} alignItems={"center"}>
          <Typography variant={"h2"} color={"#333"} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack
          width={'800px'}
          height={'600px'}
          spacing={2}
          overflow={'scroll'}>
          {
            pantry.map(({ name, count, catagory = 'pantry', image = "pantry" }) => (
              <Box
                key={name}
                width={'100%'}
                minHeight={'150px'}
                bgcolor={'#f0f0f0'}
                display={'flex'}
                alignItems={'center'}
                gap={2}
                paddingX={5}>
                <Box width={133} height={82.5} bgcolor={"blue"}>
                  <img src={image} alt={name} aspectRatio={4 / 3} width={110} height={82.5} />
                </Box>
                <Grid container justifyContent={'space-between'} alignItems={'center'} direction={'row'} spacing={{ xs: 1, sm: 2 }}>
                  <Grid item md={8}>
                    <Typography
                      variant={"h4"}
                      color={"#333"}
                      textAlign={'left'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant={"h8"}
                      color={"#333"}
                      textAlign={'center'}
                      display={'flex'}
                      justifyContent={'center'}
                      alignItems={'center'}>
                      Quantity: {count}</Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography display={'flex'} justifyContent={'start'} alignItems={'center'} paddingLeft={"5px"} >{catagory}</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="delete"
                      color={"error"}
                      onClick={() => removeItem(name)} display={"flex"}
                      justifyContent={'end'}
                      alignItems={'end'}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}
