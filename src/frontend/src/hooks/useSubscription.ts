import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlanType, SubscriptionTier } from "../backend";
import { useActor } from "../lib/backend";

export type SubscriptionTierKind = "free" | "plus" | "pro";

export interface SubscriptionView {
  tier: SubscriptionTierKind;
  status: "active" | "canceled" | "past_due" | "none";
  currentPeriodEnd?: number;
}

function backendTierToKind(tier: SubscriptionTier): SubscriptionTierKind {
  if (tier === SubscriptionTier.plus) return "plus";
  if (tier === SubscriptionTier.pro) return "pro";
  return "free";
}

function kindToBackendTier(kind: SubscriptionTierKind): SubscriptionTier {
  if (kind === "plus") return SubscriptionTier.plus;
  if (kind === "pro") return SubscriptionTier.pro;
  return SubscriptionTier.free;
}

export function useMySubscription() {
  const { actor, isFetching } = useActor();
  return useQuery<SubscriptionView>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return { tier: "free", status: "none" };
      const sub = await actor.getMySubscription();
      if (!sub) return { tier: "free", status: "none" };
      return {
        tier: backendTierToKind(sub.tier),
        status: sub.status as "active" | "canceled" | "past_due" | "none",
        currentPeriodEnd: Number(sub.currentPeriodEnd),
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tier,
      successUrl,
      cancelUrl,
      billing,
    }: {
      tier: SubscriptionTierKind;
      successUrl: string;
      cancelUrl: string;
      billing?: "monthly" | "annual";
    }) => {
      if (!actor) throw new Error("actor_not_ready");
      const planType: PlanType =
        billing === "annual" ? PlanType.annual : PlanType.monthly;
      // Pass billing cycle as a URL query param on the success URL so the backend can use annual price IDs
      const finalSuccessUrl =
        billing === "annual" ? `${successUrl}&billing=annual` : successUrl;
      const result = await actor.createCheckoutSession(
        kindToBackendTier(tier),
        planType,
        finalSuccessUrl,
        cancelUrl,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (checkoutUrl) => {
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      window.location.href = checkoutUrl;
    },
    onError: (err: Error) => {
      if (err.message === "actor_not_ready") {
        toast.error(
          "يجب على المسؤول ربط Stripe أولاً / Admin must configure Stripe first",
        );
      } else {
        toast.error(
          `حدث خطأ أثناء إنشاء جلسة الدفع / Checkout failed: ${err.message}`,
        );
      }
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("actor_not_ready");
      const result = await actor.cancelSubscription();
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("تم إلغاء الاشتراك / Subscription canceled");
    },
    onError: (err: Error) => {
      toast.error(`فشل إلغاء الاشتراك / Cancel failed: ${err.message}`);
    },
  });
}

export function useCreateCustomerPortalSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("actor_not_ready");
      const returnUrl = window.location.href;
      const result = await actor.createCustomerPortalSession(returnUrl);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: (portalUrl) => {
      window.location.href = portalUrl;
    },
    onError: (err: Error) => {
      if (err.message === "actor_not_ready") {
        toast.error(
          "يجب على المسؤول ربط Stripe أولاً / Admin must configure Stripe first",
        );
      } else {
        toast.error(`فشل فتح بوابة الدفع / Portal failed: ${err.message}`);
      }
    },
  });
}
