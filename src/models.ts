export type Resolver = "auto" | "custom";
export type ResolverMode = "percent" | "absolute";

export enum LoadStatus {
  Loading = "loading",
  Failed = "failed",
  Completed = "completed"
}

export interface LoadData {
  type: "SUCCESS" | "ERROR";
  status?: number;
  data?: string;
  stringToCompare?: string | undefined;
  nodeUrl: string;
}

export interface LoadCompleted {
  [id: string]: {
    nodeUrls: string[];
    data: string;
    stringToCompare: string | undefined;
  };
}

export interface LoadErrors {
  [nodeUrl: string]: {
    nodeUrl: string;
    status?: number;
  };
}

export enum LoadError {
  // request
  IncompleteAddress = "The address is incomplete",
  ChainNotFound = "Blockchain not found",
  MissingBlockchainData = "Missing data from the blockchain",
  RecordNotFound = "Record not found",

  // not found
  ResourceNotFound = "Contract not found",

  // server error
  ServerError = "Server error",

  // resolver
  InsufficientNumberOfNodes = "Insufficient number of nodes",
  OutOfNodes = "Out of nodes",
  UnstableState = "Unstable state",
  UnaccurateState = "Unaccurate state",

  // parsing
  FailedToParseResponse = "Failed to parse response",
  InvalidManifest = "Invalid manifest", // for dappy manifests
  InvalidSignature = "Invalid signature",
  InvalidRecords = "Invalid records", // for records
  InvalidNodes = "Invalid nodes" // for nodes
}

export interface LoadErrorWithArgs {
  error: LoadError;
  args: { [key: string]: any };
}
