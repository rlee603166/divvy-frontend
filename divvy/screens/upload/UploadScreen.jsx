// UploadScreen.js
import { useEffect, useState, useRef } from "react";
import PhotoReview from "./PhotoReviewScreen";
import { View } from "react-native";

import CameraScreen from "../../components/upload/CameraScreen";
import ContactList from "../../components/main/ContactList";
import LoadingWrapper from "../../components/main/LoadingWrapper";
import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";

import ReceiptService from "../../services/ReceiptService";
import UserService from "../../services/UserService";

import { useUser } from "../../services/UserProvider";
import { useFriends } from "../../hooks/useFriends";
import { useGroups } from "../../context/GroupsContext";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [peopleHashMap, setPeopleHashMap] = useState({});
    const [inputType, setInputType] = useState(null);
    const [wrapperIsLoading, setWrapperIsLoading] = useState(false);
    const [receiptID, setReceiptID] = useState(null);
    const receiptIDRef = useRef(null);
    const [apiData, setApiData] = useState({});
    const [ocrData, setOcrData] = useState({});
    const [receiptItems, setReceiptItems] = useState([]);
    const [receiptTotal, setReceiptTotal] = useState(0);

    const { id } = useUser();
    const { friends } = useFriends();
    const { groups } = useGroups();
    const receiptService = new ReceiptService();
    const userService = new UserService();

    useEffect(() => {
        if (ocrData && Array.isArray(ocrData.items)) {
            setReceiptItems(ocrData.items);
            const total = ocrData.items.reduce((sum, item) => {
                const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + (isNaN(price) ? 0 : price);
            }, 0);
            setReceiptTotal(total);
        }
    }, [ocrData]);

    const handlePictureTaken = (uri, type = "camera") => {
        if (type === "manual") {
            setInputType("manual");
            console.log(JSON.stringify(friends, null, 2));
            setStep(2);
        } else {
            setInputType("camera");
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleBack = () => {
        if (step === 3) {
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
            setStep(2);
            return;
        }

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
            const data = await receiptService.upload(photoUri, id);
            setReceiptID(data.receipt_id);
            receiptIDRef.current = data.receipt_id;
            setApiData(data);
        } catch (error) {
            console.log(error);
            setStep(0);
        }
    };

    const handleSelectPeople = async (selectedItems, isUpdate = false) => {
        setWrapperIsLoading(true);

        if (!isUpdate) {
            // Full reset only when coming from initial user selection screen
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
        } else {
            // For updates from edit button, only remove assignments for removed users
            const newUserIds = new Set(selectedItems.uniqueMemberIds.map(member => member.id));

            setReceiptItems(prevItems =>
                prevItems.map(item => {
                    // Filter out assignments for users that are no longer selected
                    const updatedPeople = (item.people || []).filter(person =>
                        newUserIds.has(person.id)
                    );

                    return {
                        ...item,
                        people: updatedPeople,
                        users: updatedPeople.length || 1,
                    };
                })
            );
        }

        setSelectedPeople(selectedItems);

        if (!isUpdate) {
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
        } else {
            setWrapperIsLoading(false);
        }
    };

    const handleReceiptUpdate = (items, total) => {
        setReceiptItems(items);
        setReceiptTotal(total);
    };

    const handleSplitBill = result => {
        setProcessed(result);
        setStep(4);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CameraScreen navigation={navigation} onPictureTaken={handlePictureTaken} />;
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
                            onSelectPeople={items => handleSelectPeople(items, false)}
                            type="Next"
                            handleBack={handleBack}
                            fetchedFriends={friends}
                            fetchedGroups={groups}
                            groupData={selectedPeople}
                        />
                    </LoadingWrapper>
                );
            case 3:
                return (
                    <LoadingWrapper isLoading={wrapperIsLoading}>
                        <ReceiptView
                            navigation={navigation}
                            setStep={handleBack}
                            onProcessed={handleSplitBill} // This now correctly sets step to 4
                            selectedPeople={selectedPeople}
                            photoUri={photoUri}
                            ocrData={{
                                items: receiptItems,
                                subtotal: receiptTotal,
                            }}
                            setPeopleHashMap={setPeopleHashMap}
                            onUpdatePeople={items => handleSelectPeople(items, true)}
                            onUpdateReceipt={handleReceiptUpdate}
                            initialTotal={receiptTotal}
                        />
                    </LoadingWrapper>
                );
            case 4:
                return (
                    <ReviewWrapper
                        setStep={newStep => {
                            // Only allow specific step transitions from review
                            if (newStep === 3) {
                                setStep(3); // Allow going back to ReceiptView
                            } else if (newStep === 0) {
                                // Reset the entire flow
                                setPhotoUri(null);
                                setApiData(null);
                                setReceiptID(null);
                                setOcrData(null);
                                setReceiptItems([]);
                                setReceiptTotal(0);
                                setSelectedPeople(null);
                                setProcessed({});
                                setStep(0);
                            }
                        }}
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
