import { Box, Stack, Typography } from "@mui/material";

const foodItem = [
  'tomato',
  'potato',
  'carrot',
  'cabbage',
  'cauliflower',
  'broccoli',
  'lettuce',
  'cucumber',
  'onion',
  'garlic'
]
export default function Home() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
    >
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
          height={'600px'}
          spacing={2}
          overflow={'scroll'}
        >
          {
            foodItem.map(i => (
              <Box
                key={i}
                width={'100%'}
                height={'100px'}
                bgcolor={'#f0f0f0'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >

                <Typography
                  variant={"h3"}
                  color={"#333"}
                  textAlign={'center'}>
                  {
                    // Capitalize the first letter fo the item
                    i.charAt(0).toUpperCase() + i.slice(1)
                  }
                </Typography>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}
