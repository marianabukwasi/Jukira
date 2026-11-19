export type UserRole = "ADMIN" | "FUNERAL_HOME" | "FAMILY_OWNER";

export type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type ProjectStatus =
  | "PROJECT_CREATED"
  | "COLLECTING_CONTRIBUTIONS"
  | "CONTRIBUTIONS_CLOSED"
  | "MEDIA_ORGANISED"
  | "IN_PRODUCTION"
  | "QUALITY_REVIEW"
  | "READY_FOR_FAMILY_REVIEW"
  | "FINAL_FILM_DELIVERED";

export const PROJECT_STATUS_STEPS: {
  key: ProjectStatus;
  label: string;
  shortLabel: string;
}[] = [
  { key: "PROJECT_CREATED", label: "Project created", shortLabel: "Created" },
  {
    key: "COLLECTING_CONTRIBUTIONS",
    label: "Contributions being collected",
    shortLabel: "Collecting",
  },
  {
    key: "CONTRIBUTIONS_CLOSED",
    label: "Contributions closed",
    shortLabel: "Closed",
  },
  {
    key: "MEDIA_ORGANISED",
    label: "Media organised",
    shortLabel: "Organised",
  },
  {
    key: "IN_PRODUCTION",
    label: "Film in production",
    shortLabel: "In Production",
  },
  {
    key: "QUALITY_REVIEW",
    label: "Quality review",
    shortLabel: "Quality Review",
  },
  {
    key: "READY_FOR_FAMILY_REVIEW",
    label: "Ready for family review",
    shortLabel: "Family Review",
  },
  {
    key: "FINAL_FILM_DELIVERED",
    label: "Final film delivered",
    shortLabel: "Delivered",
  },
];

export type FilmDurationTier =
  | "MEMORY_COLLECTION"
  | "PHOTO_SLIDESHOW"
  | "UP_TO_10"
  | "10_TO_20"
  | "20_TO_30"
  | "30_TO_45"
  | "45_TO_60";

export const FILM_DURATION_LABELS: Record<FilmDurationTier, string> = {
  MEMORY_COLLECTION: "Memory Collection (Unedited Compilation)",
  PHOTO_SLIDESHOW: "Photo Tribute Slideshow (Photos Only)",
  UP_TO_10: "Short Memorial Film (Up to 10 minutes)",
  "10_TO_20": "Standard Memorial Film (10–20 minutes)",
  "20_TO_30": "Extended Memorial Film (20–30 minutes)",
  "30_TO_45": "Feature Memorial Film (30–45 minutes)",
  "45_TO_60": "Full Life Documentary (45–60 minutes)",
};

export type EnhancementPreference =
  | "KEEP_ORIGINAL"
  | "STANDARD_CORRECTION"
  | "AI_ENHANCEMENT";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MediaType = "IMAGE" | "VIDEO";

export type UploadStatus = "PENDING" | "UPLOADED" | "FAILED";

export type RelationshipType =
  | "Family member"
  | "Friend"
  | "Colleague"
  | "Neighbour"
  | "Other";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type ServiceType =
  | "FILM_PRODUCTION"
  | "RAW_FOOTAGE"
  | "ARCHIVE_SUBSCRIPTION"
  | "MEMORIAL_WEBSITE";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";

export type RetentionStatus =
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "SCHEDULED_DELETION"
  | "DELETED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  funeralHomeId?: string | null;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  telephone: string | null;
  role: UserRole;
  account_status: AccountStatus;
  funeral_home_id: string | null;
  created_at: string;
}

export interface FuneralHomeRecord {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  country: string;
  currency: string;
  account_status: AccountStatus;
  white_label_enabled: number;
  white_label_name: string | null;
  white_label_monthly_fee: number;
  created_at: string;
}

export interface ProjectRecord {
  id: string;
  secure_token: string;
  project_type: "PERSON" | "PET";
  deceased_full_name: string;
  deceased_preferred_name: string;
  date_of_birth: string | null;
  date_of_passing: string | null;
  main_photo_url: string | null;
  owner_id: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  funeral_home_id: string | null;
  film_duration_tier: FilmDurationTier;
  preferred_language: string;
  country_market: string;
  currency: string;
  project_status: ProjectStatus;
  closing_date: string | null;
  opening_title: string | null;
  closing_title: string | null;
  music_choice: string | null;
  presentation_style: string | null;
  include_shorter_version: number;
  review_required: number;
  raw_footage_purchased: number;
  created_at: string;
}

export interface ContributorRecord {
  id: string;
  project_id: string;
  name: string;
  relationship: string;
  relationship_custom: string | null;
  contact_info: string | null;
  accepted_terms_version: string;
  accepted_at: string;
  created_at: string;
}

export interface MediaRecord {
  id: string;
  project_id: string;
  contributor_id: string;
  file_type: MediaType;
  mime_type: string;
  storage_key: string;
  original_filename: string;
  file_size: number;
  video_duration_sec: number | null;
  upload_status: UploadStatus;
  caption: string | null;
  event_date: string | null;
  event_location: string | null;
  enhancement_preference: EnhancementPreference;
  approval_status: ApprovalStatus;
  flagged: number;
  created_at: string;
}

export interface ProductionJobRecord {
  id: string;
  project_id: string;
  assigned_to: string | null;
  editing_status: string;
  review_status: "PENDING" | "PASSED" | "CHANGES_REQUESTED";
  qc_checklist_json: string;
  output_file_key: string | null;
  shorter_file_key: string | null;
  raw_archive_key: string | null;
  notes: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface PricingConfigRecord {
  id: string;
  country_code: string;
  country_name: string;
  currency: string;
  tier_collection: number;
  tier_slideshow: number;
  tier_10: number;
  tier_20: number;
  tier_30: number;
  tier_45: number;
  tier_60: number;
  raw_footage_price: number;
  archive_monthly_price: number;
  website_setup_price: number;
  website_annual_renewal: number;
  estimated_production_cost: number;
  upload_allowance_gb: number;
  updated_at: string;
}

export interface OrderPaymentRecord {
  id: string;
  project_id: string;
  customer_user_id: string | null;
  customer_name: string;
  service_type: ServiceType;
  package_label: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  provider_reference: string | null;
  invoice_number: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  project_id: string;
  customer_user_id: string | null;
  status: SubscriptionStatus;
  monthly_price: number;
  currency: string;
  renewal_date: string;
  expiry_date: string | null;
  created_at: string;
}

export interface ArchiveRecord {
  id: string;
  project_id: string;
  storage_location: string;
  retention_status: RetentionStatus;
  deletion_date: string | null;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  recipient_email: string;
  recipient_role: string;
  project_id: string | null;
  event_type: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  details: string | null;
  created_at: string;
}

export interface MemorialMilestone {
  year: string;
  title: string;
  description: string;
}

export interface MemorialWebsiteRecord {
  id: string;
  project_id: string;
  enabled: number;
  welcome_message: string;
  life_story: string;
  milestones_json: string;
  hosting_term: "ANNUAL" | "SIX_MONTHS";
  expires_at: string | null;
  moderation_required: number;
  listed_in_garden: number;
  garden_location: string | null;
  garden_tribute: string | null;
  updated_at: string;
}

export interface MemorialMessageRecord {
  id: string;
  project_id: string;
  author_name: string;
  relationship: string;
  message: string;
  attachment_media_id: string | null;
  status: "APPROVED" | "PENDING" | "HIDDEN";
  created_at: string;
}

export type PlotVerificationStatus =
  | "PENDING"
  | "PARTNER_VERIFIED"
  | "APPROVED"
  | "DISPUTED"
  | "RESTRICTED"
  | "INACTIVE"
  | "ARCHIVED"
  | "REMOVED";

export interface MemorialPlotRecord {
  id: string;
  project_id: string | null;
  garden_type: "HUMAN" | "PET";
  country: string;
  virtual_city: string | null;
  actual_burial_location: string | null;
  meaningful_resting_place: string | null;
  section_name: string;
  plot_reference: string;
  plot_type: "INDIVIDUAL" | "FAMILY_PLOT";
  family_plot_name: string | null;
  deceased_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  photo_url: string | null;
  environment_template: string;
  pathway_template: string;
  headstone_style: string;
  headstone_color: string;
  inscription: string;
  verification_status: PlotVerificationStatus;
  privacy_level: "PUBLIC" | "UNLISTED" | "PRIVATE";
  allow_visits: number;
  allow_flowers: number;
  allow_messages: number;
  support_family_label: string | null;
  support_family_url: string | null;
  visit_count: number;
  last_visited_at: string | null;
  created_at: string;
}

export interface DigitalFlowerRecord {
  id: string;
  plot_id: string;
  flower_type: string;
  sender_name: string | null;
  is_anonymous: number;
  message: string | null;
  price_paid: number;
  currency: string;
  placed_at: string;
}

export interface MemorialChallengeRecord {
  id: string;
  plot_id: string;
  challenger_name: string;
  challenger_email: string;
  reason: string;
  details: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  created_at: string;
}
