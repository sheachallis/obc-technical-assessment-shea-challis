import "./App.css";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Data from "./data/ta_exceedences.csv";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ChakraProvider, HStack } from "@chakra-ui/react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { BsChevronDown, BsArrowDownUp } from "react-icons/bs";

function App() {
  // FETCHING & STORING THE DATA
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(Data);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      }).data;
      setData(parsedData);
      setOriginalData(parsedData);
    };
    fetchData();
  }, []);

  // LOADING THE GOOGLE MAPS API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCRCvDfGiY_yELLnXfzKetSuq1BlNN-Bmk",
  });

  // SETTING THE MARKER POSITION
  const [selectedKey, setSelectedKey] = useState(null);
  const [position, setPosition] = useState(null);
  function setMarker(latitude, longitude, index) {
    setPosition({ lat: Number(latitude), lng: Number(longitude) });
    setSelectedKey(index);
  }

  // SELECTING THE DATE
  const dates = [];
  for (let i = 0; i < data.length; i++) {
    if (
      !dates.includes(
        new Date(data[i].UNIX_TIME * 1000).toLocaleDateString("en-GB")
      )
    ) {
      dates.push(
        new Date(data[i].UNIX_TIME * 1000).toLocaleDateString("en-GB")
      );
    }
  }
  const [selectedDate, setSelectedDate] = useState(null);
  function selectDate(date) {
    setData(originalData);
    setSelectedDate(date);
    setDirection("dsc");
  }
  function deselectDate() {
    setData(originalData);
    setSelectedDate(null);
    setDirection("dsc");
  }

  // SORTING THE SCORES
  const [direction, setDirection] = useState("dsc");
  function handleSort(score) {
    if (direction === "dsc") {
      const sorted = [...data].sort((a, b) => (a[score] < b[score] ? 1 : -1));
      setData(sorted);
      setDirection("asc");
    }
    if (direction === "asc") {
      const sorted = [...data].sort((a, b) => (a[score] > b[score] ? 1 : -1));
      setData(sorted);
      setDirection("dsc");
    }
  }

  return (
    <ChakraProvider>
      <HStack justifyContent="space-between">
        <div className="map-container">
          {!isLoaded ? (
            <h1>Loading map...</h1>
          ) : (
            <GoogleMap
              mapContainerClassName="map"
              center={position ? position : { lat: 51.50844, lng: -0.12495 }}
              zoom={12}
            >
              <MarkerF position={position} />
            </GoogleMap>
          )}
        </div>
        <Box className="list-box" overflowX="scroll">
          <TableContainer>
            <Table
              id="table"
              border="1px solid"
              borderColor="gray.300"
              colorScheme="blue"
              variant="striped"
              size="sm"
            >
              <Thead>
                <Tr>
                  <Th>
                    <Menu>
                      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
                        Date
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => deselectDate()}>
                          Show all
                        </MenuItem>
                        {dates.map((date) => (
                          <MenuItem key={date} onClick={() => selectDate(date)}>
                            {date}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Th>
                  <Th>Time</Th>
                  <Th>Issue</Th>
                  <Th>
                    <Button
                      rightIcon={<BsArrowDownUp />}
                      onClick={() => handleSort("SCORE")}
                    >
                      Exceedence
                    </Button>
                  </Th>
                  <Th>Postion</Th>
                  <Th>Rec ID</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedDate
                  ? data.map((row, index) =>
                      new Date(row.UNIX_TIME * 1000).toLocaleDateString(
                        "en-GB"
                      ) === selectedDate ? (
                        <Tr
                          cursor="pointer"
                          key={index}
                          fontWeight={index === selectedKey ? "bold" : "normal"}
                          onClick={() =>
                            setMarker(row.LATITUDE, row.LONGITUDE, index)
                          }
                        >
                          <Td>
                            {new Date(row.UNIX_TIME * 1000).toLocaleDateString(
                              "en-GB"
                            )}
                          </Td>
                          <Td>
                            {new Date(row.UNIX_TIME * 1000).toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Td>
                          <Td>{row.ASSET_NAME}</Td>
                          <Td>{row.SCORE}º</Td>
                          <Td>{row.POSITION_YARDS} yards</Td>
                          <Td>{row.RECORDING_ID}</Td>
                        </Tr>
                      ) : null
                    )
                  : data.map((row, index) => (
                      <Tr
                        cursor="pointer"
                        key={index}
                        fontWeight={index === selectedKey ? "bold" : "normal"}
                        onClick={() =>
                          setMarker(row.LATITUDE, row.LONGITUDE, index)
                        }
                      >
                        <Td>
                          {new Date(row.UNIX_TIME * 1000).toLocaleDateString(
                            "en-GB"
                          )}
                        </Td>
                        <Td>
                          {new Date(row.UNIX_TIME * 1000).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Td>
                        <Td>{row.ASSET_NAME}</Td>
                        <Td>{row.SCORE}º</Td>
                        <Td>{row.POSITION_YARDS} yards</Td>
                        <Td>{row.RECORDING_ID}</Td>
                      </Tr>
                    ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </HStack>
    </ChakraProvider>
  );
}

export default App;
