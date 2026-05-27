"use client";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { INITIAL_FORM_STATE } from "@/global/constants/onboarding.constants";
import {
  type ChangeAnimation,
  type FormState,
} from "@/global/types/onboarding.types";
import OnboardingStepManager from "@/components/Onboarding/OnboardingStepManager";
import StepOne from "@/components/Onboarding/steps/StepOne";
import StepTwo from "@/components/Onboarding/steps/StepTwo";
import StepThree from "@/components/Onboarding/steps/StepThree";
import { useRouter } from "next/navigation";
import {
  isStepValid,
  toBackendPayload,
} from "@/components/Onboarding/onboarding.utils";
import { API_BASE_URL } from "@/global/constants/api.constants";

export default function Onboarding() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formLayer, setFormLayer] = useState(0);
  const [changeAnimation, setChangeAnimation] = useState<ChangeAnimation>({
    active: false,
    offset: 0,
  });

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    if (key === "needsKitasSchoolsUnis" && value == false) {
      setFormState((prev) => ({
        ...prev,
        importanceKitas: "",
        importanceSchulen: "",
        importanceUnis: "",
      }));
    } else if (key === "goesToBarsClubs" && value == false) {
      setFormState((prev) => ({
        ...prev,
        importanceClubs: "",
        importanceBars: "",
      }));
    } else if (key === "wantsCentralLiving" && value == false) {
      setFormState((prev) => ({
        ...prev,
        importanceCityCenter: "",
        importancePublicTransport: "",
      }));
    }
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const formLayers: ReactNode[] = [
    <StepOne key="step-1" formState={formState} onChange={handleChange} />,
    <StepTwo key="step-2" formState={formState} onChange={handleChange} />,
    <StepThree key="step-3" formState={formState} onChange={handleChange} />,
  ];

  const handleNext = () => {
    if (formLayer >= formLayers.length - 1) return;
    if (!isStepValid(formLayer, formState)) {
      setError("Please fill all required fields.");
      return;
    } else {
      setError("");
    }
    setChangeAnimation({ active: true, offset: -800 });
    setTimeout(() => setFormLayer((prev) => prev + 1), 300);
  };

  const handlePrev = () => {
    if (formLayer === 0) return;
    setChangeAnimation({ active: true, offset: 800 });
    setTimeout(() => setFormLayer((prev) => prev - 1), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid(formLayer, formState)) {
      setError("Please fill all required fields.");
      return;
    } else {
      setError("");
    }
    const payload = toBackendPayload(formState);
    const response = await fetch(`${API_BASE_URL}/api/get-matching-scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((response) => response.json());

    sessionStorage.setItem("onboarding", JSON.stringify(await response));
    router.push("/map");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-16 mt-16 lg:border rounded-3xl transition-all">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet className="overflow-hidden">
            <FieldLegend className="text-2xl font-bold">
              Fill to find the best fit
            </FieldLegend>
            <FieldDescription>
              All the data is stored in a secure and encrypted way and used only
              for the purpose of finding the best fit for you.
            </FieldDescription>

            {error && (
              <FieldDescription className="text-red-500 text-sm font-medium mt-2 transition">
                *{error}
              </FieldDescription>
            )}

            <OnboardingStepManager
              formLayers={formLayers}
              activeLayer={formLayer}
              changeAnimation={changeAnimation}
              setChangeAnimation={setChangeAnimation}
            />
          </FieldSet>

          <Field orientation="horizontal" className="justify-between">
            <Button
              type="button"
              onClick={handlePrev}
              disabled={formLayer === 0}
            >
              <ArrowLeftIcon /> Previous
            </Button>

            {formLayer === formLayers.length - 1 ? (
              <Button type="submit">Submit</Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next <ArrowRightIcon />
              </Button>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
