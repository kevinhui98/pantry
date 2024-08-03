'use client'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, Grid, Divider, Slider, Input } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import Remove from "@mui/icons-material/Remove";
import Add from "@mui/icons-material/Add";
import GoogleIcon from '@mui/icons-material/Google';
import { firestore, auth, GoogleAuthProvider, signInWithPopup } from "../firebase";
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, where } from "firebase/firestore";
import { useEffect, useState, useRef, Fragment } from "react";
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
  const [searchCatagory, setSearchCatagory] = useState('');
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
  const addItem = async (cat = 'pantry', item, quantity, img) => {
    if (cat === '') cat = 'pantry';
    const docRef = doc(collection(firestore, "pantry"), item)
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

  const search = async (item, cat) => {
    //create a query to get the document with the item name
    const pantryref = collection(firestore, 'pantry')
    const q1 = query(pantryref, where('name', '==', item))
    const q2 = query(pantryref, where('catagory', '==', cat))
    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    const pantryList = [];
    querySnapshot1.forEach(doc => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    querySnapshot2.forEach(doc => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
    // const snapshot = query(collection(firestore, 'pantry'), or());
    // const docs = await getDocs(snapshot);
    // const pantryList = [];
    // docs.forEach(doc => {
    //   pantryList.push({ name: doc.id, ...doc.data() });
    // });
    // setPantry(pantryList);
  }
  const ChildModal = () => {
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
  // add quantity slider
  const [value, setValue] = useState(1);
  const handleSliderChange = (event, newValue) => setValue(newValue);
  const handleInputChange = (event) => setValue(event.target.value === '' ? 1 : Number(event.target.value));
  const handleBlur = () => {
    if (value < 1) {
      setValue(1);
    } else if (value > 10) {
      setValue(10);
    }
  };
  var firebase = require('firebase');
  var firebaseui = require('firebaseui');
  const OAuth = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      paddingTop={5}
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
          <Stack direction={"column"} spacing={2} >
            <TextField id="outlined-basic" label="Pantry (Optional)" variant="outlined" fullWidth
              onChange={(e) => setCatagory(e.target.value)} />
            <Stack direction={'row'} spacing={2}>
              <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth
                onChange={(e) => setItemName(e.target.value)} required />
            </Stack>
            <Box id={"quantity"}>
              <Typography id="input-slider" gutterBottom>
                Quantity
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <IconButton sx={{ cursor: 'pointer' }} onClick={(e) => {
                    if (value > 1) handleSliderChange(e, value - 1)
                  }} onChange={handleSliderChange}>
                    <Remove />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Slider
                    value={typeof value === 'number' ? value : 1}
                    onChange={handleSliderChange}
                    aria-labelledby="input-slider"
                    step={1}
                    min={1}
                    max={10}
                  />
                </Grid>
                <Grid item>
                  <IconButton sx={{ cursor: 'pointer' }} onClick={(e) => {
                    if (value < 10) handleSliderChange(e, value + 1)
                  }} onChange={handleSliderChange}>
                    <Add />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Input
                    value={value}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 10,
                      type: 'number',
                      'aria-labelledby': 'input-slider',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <ChildModal />
            <Divider orientation="horizontal" flexItem />
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
            <TextField id="outlined-basic" label="Catagory" variant="outlined" fullWidth
              onChange={(e) => setSearchCatagory(e.target.value)}
            />
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth
              onChange={(e) => setSearchItem(e.target.value)}
            />
            <Divider orientation="horizontal" flexItem />
            <Button variant={"contained"} color={"primary"}
              onClick={() => {
                search(searchItem, searchCatagory)
                setSearchItem("")
                setSearchCatagory("")
                handleSearchClose()
              }}>Search</Button>
          </Stack>
        </Box>
      </Modal>
      <IconButton onClick={OAuth}>
        <GoogleIcon />
      </IconButton>
      <Box>
        <Stack direction={"row"} spacing={4} divider={<Divider orientation="vertical" flexItem />}>
          <Button variant={"contained"} color={"primary"} onClick={handleAddOpen}>Add</Button>
          <Button variant={"contained"} color={"primary"} onClick={handleSearchOpen}>Search</Button>
          <Button variant={"contained"} color={"primary"} onClick={updatePantries} startIcon={<RefreshIcon />}> Refresh</Button>
          {/* <Button variant={"contained"} color={"primary"} >GPT</Button> */}
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
            pantry.map(({ name, count, catagory, image }) => (
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
                  <img src={image} alt={name} aspectpatio={4 / 3} width={110} height={82.5} />
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
                      Quantity:
                      <IconButton>
                        <Remove />
                      </IconButton>
                      {count}
                      <IconButton>
                        <Add />
                      </IconButton>
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography display={'flex'} justifyContent={'start'} alignItems={'center'} paddingLeft={"5px"} >{catagory}</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="delete"
                      color={"error"}
                      onClick={() => removeItem(name)} display={"flex"}
                      sx={{ cursor: 'pointer' }}>
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
