'use client'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, Grid, Divider, Slider, Input } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import Remove from "@mui/icons-material/Remove";
import Add from "@mui/icons-material/Add";
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from "../firebase";
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

  // Searching for items within modal
  const [itemname, setItemName] = useState('');
  const [category, setcategory] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
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
    if (img === null) img = 'https://st.depositphotos.com/2218212/2938/i/450/depositphotos_29387653-stock-photo-facebook-profile.jpg';
    const docRef = doc(collection(firestore, "pantry"), item)
    const subCat = await getDoc(docRef);
    //if the document already exists, update the count
    if (subCat.exists()) {
      // console.log("subCat ", subCat.data());
      const name = subCat.data().name;
      if (img === null) img = subCat.data().image;
      const count = subCat.data().count + quantity;
      await setDoc(docRef, { name, count, category: cat, image: img });
    }
    else {
      //if the document does not exist, create a new document with the item name and count 1
      await setDoc(docRef, { name: item, count: quantity, category: cat, image: img });

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
    const q2 = query(pantryref, where('category', '==', cat))
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
  const [quantity, setQuantity] = useState(1);
  const handleSliderChange = (event, newValue) => setQuantity(newValue);
  const handleInputChange = (event) => setQuantity(event.target.value === '' ? 1 : Number(event.target.value));
  const handleBlur = () => {
    if (quantity < 1) {
      setQuantity(1);
    } else if (quantity > 10) {
      setQuantity(10);
    }
  };
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
      <Modal id={"add-modal"}
        open={addOpen}
        onClose={handleAddClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Stack direction={"row"} justifyContent={'space-between'} alignContent={"center"}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <CloseIcon onClick={handleAddClose} sx={{ cursor: 'pointer' }} />
          </Stack>

          <Stack direction={"column"} spacing={2} >
            <TextField id="outlined-basic" label="Pantry (Optional)" variant="outlined" fullWidth
              onChange={(e) => setcategory(e.target.value)} />
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
                    if (value > 1) handleSliderChange(e, quantity - 1)
                  }} onChange={handleSliderChange}>
                    <Remove />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Slider
                    value={typeof quantity === 'number' ? quantity : 1}
                    onChange={handleSliderChange}
                    aria-labelledby="input-slider"
                    step={1}
                    min={1}
                    max={10}
                  />
                </Grid>
                <Grid item>
                  <IconButton sx={{ cursor: 'pointer' }} onClick={(e) => {
                    if (quantity < 10) handleSliderChange(e, quantity + 1)
                  }} onChange={handleSliderChange}>
                    <Add />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Input
                    value={quantity}
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
                addItem(category, itemname, quantity, saveImage)
                setcategory("")
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
      <Modal id={"quantity-modal"}
        open={searchOpen}
        onClose={handleSearchClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack direction={"row"} justifyContent={'space-between'} alignContent={"center"}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Search Item
            </Typography>
            <CloseIcon onClick={handleSearchClose} sx={{ cursor: 'pointer' }} />
          </Stack>
          <Stack direction={"column"} spacing={2}>
            <TextField id="outlined-basic" label="category" variant="outlined" fullWidth
              onChange={(e) => setSearchCategory(e.target.value)}
            />
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth
              onChange={(e) => setSearchItem(e.target.value)}
            />
            <Divider orientation="horizontal" flexItem />
            <Button variant={"contained"} color={"primary"}
              onClick={() => {
                search(searchItem, searchCategory)
                setSearchItem("")
                setSearchCategory("")
                handleSearchClose()
              }}>Search</Button>
          </Stack>
        </Box>
      </Modal>
      {/* <Stack direction={'row'} spacing={2}> */}
      {/* <Box width={370}>
          <Stack direction={"row"}>
            <TextField id="filled-basic" label="Category (optional)" variant="outlined" fullWidth
              onChange={(e) => setSearchcategory(e.target.value)}
            />
            <TextField id="filled-basic" label="Item (optional)" variant="outlined" fullWidth
              onChange={(e) => setSearchItem(e.target.value)}
            />
            <IconButton variant={"contained"} color={"primary"} onClick={() => {
              search(searchItem, searchCategory)
              setSearchItem("")
              setSearchcategory("")
              handleSearchClose()
            }}>
              <SearchIcon />
            </IconButton>
          </Stack>
        </Box> */}
      <Box border={'1px solid #333'}>
        <Box bgcolor={"#ADD8E6"} display={"flex"}
          justifyContent={"space-between"} alignItems={"center"} paddingX={1}>
          <Typography variant={"h2"} color={"#333"} textAlign={'center'}>
            Pantry Items
          </Typography>
          <Box id={'nav-bar'}>
            <Stack direction={"row"} spacing={1}>
              {/* <Box>
                <Stack direction={"row"}>
                  <TextField id="filled-basic" label="Category (optional)" variant="outlined" fullWidth
                    onChange={(e) => setSearchcategory(e.target.value)}
                  />
                  <TextField id="filled-basic" label="Item (optional)" variant="outlined" fullWidth
                    onChange={(e) => setSearchItem(e.target.value)}
                  />
                  <IconButton variant={"contained"} color={"primary"} onClick={() => {
                    search(searchItem, searchCategory)
                    setSearchItem("")
                    setSearchcategory("")
                    handleSearchClose()
                  }}>
                    <SearchIcon />
                  </IconButton>
                </Stack>
              </Box> */}
              <Button variant={"contained"} color={"primary"} onClick={handleAddOpen}>Add</Button>
              <Button variant={"contained"} color={"primary"} onClick={handleSearchOpen} startIcon={< SearchIcon />}>Search</Button>
              <Button variant={"contained"} color={"primary"} onClick={updatePantries} startIcon={<RefreshIcon />}> Refresh</Button>
              {/* <Button variant={"contained"} color={"primary"} >GPT</Button> */}
            </Stack>
          </Box>
        </Box>
        <Grid
          container
          // columns={{ xs: 1, sm: 1, md: 3, lg: 4 }}
          columns={14}
          width={'100vw'}
          height={'90vh'}
          gap={4}
          sx={{
            "background-image": "url(https://img.freepik.com/free-vector/empty-shelf-home-pantry-storage-cartoon-illustration-cellar-storehouse-interior-organise-food-vegetables-box-basement-room-nobody-wooden-underground-storeroom-with-bottle-spill_107791-21928.jpg?t=st=1722820854~exp=1722824454~hmac=27c19c19e83e35186665edab95a1ddcfd7c405f250d1d6c6455c1ebf8abc9ad1&w=1800)",
          }}
          // spacing={2}
          // spacing={{ xs: 12, md: 4, lg: 2 }}
          paddingX={5}
          paddingY={5}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          overflow={'scroll'}
        >
          {
            pantry.map(({ name, count, category, image }) => (
              <Grid item
                xs={12} sm={8} md={4} lg={3}
                key={name}
                padding={2}
                sx={{ borderRadius: '5%' }}
                // spacing={2}
                // direction={'column'}
                bgcolor={'#f0f0f0'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                container>
                {/* <Box
                margin={1}
                width={{ xs: '100vw', md: '75%', lg: '30vw' }}
                direction={{ xs: 'row', md: 'column', lg: 'column' }}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                padding={2}
                sx={{ borderRadius: '5%' }}
                > */}
                <Box item>
                  <img src={image} alt={name} aspectpatio={4 / 3} width={'100%'} height={'100%'} />
                </Box>
                <Grid item container direction={'row'}>
                  <Grid item container direction={'column'} gap={2}>
                    <Grid item>
                      <Typography
                        variant={"h4"}
                        color={"#333"}
                        textAlign={'left'}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{category}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container direction={'column'} gap={2} display={'flex'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                    <Grid item>
                      <Typography
                        variant={"h8"} color={"#333"} textAlign={'center'}>
                        <IconButton>
                          <Remove />
                        </IconButton>
                        {count}
                        <IconButton>
                          <Add />
                        </IconButton>
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Button color={"error"} variant="outlined" size="small"
                        onClick={() => removeItem(name)} display={"flex"}
                        sx={{ cursor: 'pointer' }} startIcon={<DeleteIcon />}>Remove</Button>
                    </Grid>
                  </Grid>
                </Grid>
                {/* </Box> */}
              </Grid>
            ))
          }
        </Grid>
      </Box>
      {/* </Stack> */}
    </Box >
  );
}
