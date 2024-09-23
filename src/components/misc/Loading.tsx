import Spinner from "react-native-loading-spinner-overlay";
import Loader from "./Loader";
import { useLoading } from "./useLoading";

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
