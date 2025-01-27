// UploadScreen.js
import { useEffect, useState, useRef } from "react";
import PhotoReview from "./PhotoReviewScreen";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

import CameraScreen from "../../components/upload/CameraScreen";
import AdditionalCharges from "../../components/upload/AdditionalCharges";
import ContactList from "../../components/main/ContactList";
import LoadingWrapper from "../../components/main/LoadingWrapper";

import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";

import ReceiptService from "../../services/ReceiptService";
import UserService from "../../services/UserService";
import { useUser } from "../../services/UserProvider";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [manualInput, setManualInput] = useState("");
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [peopleHashMap, setPeopleHashMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [inputType, setInputType] = useState(null);
    const [wrapperIsLoading, setWrapperIsLoading] = useState(false);

    const [receiptID, setReceiptID] = useState(null);
    const receiptIDRef = useRef(null);
    const [apiData, setApiData] = useState({});
    const [ocrData, setOcrData] = useState({});

    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);

    const { user_id } = useUser();
    const receiptService = new ReceiptService();
    const userService = new UserService();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setWrapperIsLoading(true);
                await Promise.all([fetchGroups(), fetchFriends()]);
            } catch (error) {
                console.error(error);
            } finally {
                setWrapperIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchFriends = async () => {
        const friendsData = await userService.getFriends(user_id);
        const data = friendsData.map((friend, index) => ({
            id: friend.user_id,
            name: friend.name,
            phone: `@${friend.username}` || "",
            imageUri: friend.imageUri || null,
            selected: false,
        }));

        setFriends(data);
    };

    const fetchGroups = async () => {
        const groupData = await userService.getGroups(user_id);
        const data = groupData.map((group, index) => ({
            id: group.group_id,
            name: group.name,
            members: group.members.map((friend, index) => ({
                id: friend.user_id,
                name: friend.users.name || "Unknown",
                phone: `@${friend.users.username}` || "",
                imageUri: friend.users.imageUri || null,
                selected: false,
            })),
            selected: false,
        }));

        setGroups(data);
    };

    const handlePictureTaken = (uri, type = "camera") => {
        if (type === "manual") {
            setInputType("manual");
            setStep(2);
        } else {
            setInputType("camera");
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleBack = () => {
        if (inputType === "manual") {
            setStep(0);
        } else {
            setStep(1);
        }
    };

    const handleRetake = () => {
        setPhotoUri(null);
        setApiData(null);
        setReceiptID(null);
        setOcrData(null);
        setStep(0);
    };

    const handleAcceptPhoto = async () => {
        try {
            setStep(2);
            const data = await receiptService.upload(photoUri, user_id);
            setReceiptID(data.receipt_id);
            receiptIDRef.current = data.receipt_id;
            setApiData(data);
        } catch (error) {
            console.log(error);
            setStep(0);
        }
    };

    const onSelectPeople = async selectedItems => {
        setWrapperIsLoading(true);
        setSelectedPeople(selectedItems);

if (inputType === "manual") {
            setStep(3);
            setWrapperIsLoading(false);
            return;
        }

        setStep(3);
        let waitAttempts = 0;
        const maxWaitAttempts = 10;

        while (!receiptIDRef.current && waitAttempts < maxWaitAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            waitAttempts++;
        }

        const currentReceiptID = receiptIDRef.current;
        if (!currentReceiptID) {
            console.error("No receipt ID available for polling");
            setWrapperIsLoading(false);
            return;
        }

        const MAX_ATTEMPTS = 10;
        const POLLING_INTERVAL = 2000;
        let attempts = 0;

        while (attempts < MAX_ATTEMPTS) {
            try {
                const data = await receiptService.fetchReceipt(currentReceiptID);
                console.log(
                    "Polling attempt",
                    attempts + 1,
                    "for receipt",
                    currentReceiptID,
                    ":",
                    data
                );

                if (data && data.status === "completed") {
                    setOcrData(data.processed_data);
                    setWrapperIsLoading(false);
                    return;
                }

                attempts++;
                await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            } catch (error) {
                console.error(`Polling error (attempt ${attempts + 1}):`, error);
                if (attempts === MAX_ATTEMPTS - 1) {
                    alert("Receipt processing failed. Please try again.");
                    setWrapperIsLoading(false);
                    return;
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            }
        }

        setWrapperIsLoading(false);
        alert("Receipt processing is taking longer than expected. Please try again later.");
    };

    const onProcessed = processedReceipt => {
        setProcessed(processedReceipt);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CameraScreen onPictureTaken={handlePictureTaken} />;
            case 1:
                return (
                    <PhotoReview
                        photoUri={photoUri}
                        onRetake={handleRetake}
                        onAccept={handleAcceptPhoto}
                    />
                );
            case 2:
                return (
                    <LoadingWrapper isLoading={wrapperIsLoading}>
                        <ContactList
                            setStep={setStep}
                            onSelectPeople={onSelectPeople}
                            type="Next"
                            handleBack={handleBack}
                            fetchedFriends={friends}
                            fetchedGroups={groups}
                        />
                    </LoadingWrapper>
                );
            case 3:
                return (
                    <LoadingWrapper isLoading={wrapperIsLoading}>
                        <ReceiptView
                            navigation={navigation}
                            setStep={setStep}
                            onProcessed={onProcessed}
                            selectedPeople={selectedPeople}
                            photoUri={photoUri}
                            ocrData={inputType === "manual" ? { items: [], subtotal: 0 } : ocrData}
                            setPeopleHashMap={setPeopleHashMap}
                        />
                    </LoadingWrapper>
                );
            case 4:
                return (
                    <ReviewWrapper 
                        setStep={setStep} 
                        processed={processed} 
                        receiptID={receiptID} 
                        peopleHashMap={peopleHashMap}
                    />
                );
            default:
                return null;
        }
    };

    return <View style={{ flex: 1 }}>{renderStep()}</View>;
};

export default UploadScreen;
