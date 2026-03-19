export type QuoteTableRow = {
  id: number;
  client: string;
  technician: string;
  status: string;
  statusSearch: string;
  creationDate: string;
  amount: number;
  raw: any;
};

export interface QuoteDetail {
  quotedetailid?: number;
  quotesid?: number;
  productid?: number | null;
  description: string;
  quantity: number;
  unitprice: number;
  subtotal: number;
  availability?: string;
}

export interface ServiceRequest {
  serviceRequestId: number;
  scheduledAt?: string;
  scheduledEndAt?: string;
  serviceType?: string;
  requestMode?: "ASSESSMENT" | "DIRECT_INSTALLATION" | null;
  technicalReviewStatus?:
    | "NOT_APPLICABLE"
    | "PENDING_REVIEW"
    | "ASSESSMENT_REQUIRED"
    | "READY_TO_QUOTE"
    | null;
  direccion?: string;
  description?: string;
  alreadyHasMaterials?: boolean;
  linkedSaleId?: number | null;
  linkedSaleCode?: string | null;
  purchasedMaterials?: Array<{
    productId?: number | null;
    name: string;
    quantity: number;
    unitPrice?: number | null;
  }>;
  siteChecklist?: {
    installationArea?: string | null;
    installationHeight?: string | null;
    estimatedCableMeters?: string | null;
    materialsSummary?: string | null;
    additionalContext?: string | null;
    evidenceNotes?: string | null;
  } | null;
  createdAt?: string;
  stateId?: number;
  serviceId?: number;
  clientId?: number;
}

export interface IQuote {
  quotesid: number;
  observation?: string | null;
  observationPlain?: string | null;
  clientAccepted?: boolean;
  clientAcceptedAt?: string | null;
  servicetype?: string | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  createdat?: string;
  updatedat?: string;
  ordersservicesid?: number | null;
  state?: {
    name?: string;
    description?: string | null;
    stateid?: number;
  };
  serviceRequest?: ServiceRequest;
  serviceRequestId?: number;
  ordersservices?: {
    ordersservicesid?: number;
    state?: {
      stateid?: number;
      name?: string;
    };
  } | null;
  customer?: {
    customerid?: number;
    userid?: number;
    customercity?: string;
    customerzipcode?: string;
    users?: {
      userid?: number;
      name?: string;
      lastname?: string;
      email?: string;
      phone?: string;
    };
  };
  technician?: {
    technicianid?: number;
    userid?: number;
    CV?: string;
    users?: {
      userid?: number;
      name?: string;
      lastname?: string;
      email?: string;
      phone?: string;
    };
  };
  details?: QuoteDetail[];
}

export type QuoteDetailPayload = {
  productId: number | null;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availability: "DISPONIBLE" | "NO_DISPONIBLE" | "SOLICITAR";
  isBackorder?: boolean;
};

export type QuoteCreatePayload = {
  serviceRequestId: number;
  ordersServicesId?: number;
  statesId: number;
  clientId: number;
  serviceType: string;
  observation?: string;
  details: Array<{
    productId: number | null;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    availability: "DISPONIBLE" | "NO_DISPONIBLE" | "SOLICITAR";
  }>;
};
