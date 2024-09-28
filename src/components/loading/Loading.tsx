import Spinner from "react-native-loading-spinner-overlay";
import { useLoading } from "../hooks/useLoading";
import Loader from "./Loader";

export default function Loading() {
  const { loading } = useLoading();
  return (
    <Spinner
      visible={loading}
      overlayColor="#00000099"
      textContent={"Loading"}
      customIndicator={<Loader />}
      textStyle={{ color: "#fff", marginTop: -25 }}
      animation="fade"
    />
  );
}
