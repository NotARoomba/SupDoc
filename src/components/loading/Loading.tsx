import { useTranslation } from "react-i18next";
import Spinner from "react-native-loading-spinner-overlay";
import { useLoading } from "../hooks/useLoading";
import Loader from "./Loader";

export default function Loading() {
  const { t } = useTranslation();
  const { loading } = useLoading();
  return (
    <Spinner
      visible={loading}
      overlayColor="#00000099"
      textContent={t("loading")}
      customIndicator={<Loader />}
      textStyle={{ color: "#fff", marginTop: -25 }}
      animation="fade"
    />
  );
}
