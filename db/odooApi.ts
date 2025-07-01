// Archivo central para llamadas a Odoo
import { rpcCall } from "../components/AttendanceKiosk/otros/rpc";
import { DB, RPC_URL } from "../components/AttendanceKiosk/otros/config";

export async function odooRead({
  model,
  fields = [],
  domain = [],
  uid,
  pass,
  limit = 80,
}: {
  model: string;
  fields?: string[];
  domain?: any[];
  uid: number;
  pass: string;
  limit?: number;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "search_read", [domain], { fields, limit }],
    RPC_URL
  );
}

export async function odooCreate({
  model,
  vals,
  uid,
  pass,
}: {
  model: string;
  vals: any;
  uid: number;
  pass: string;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "create", [vals]],
    RPC_URL
  );
}

export async function odooWrite({
  model,
  ids,
  vals,
  uid,
  pass,
}: {
  model: string;
  ids: number[];
  vals: any;
  uid: number;
  pass: string;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "write", [ids, vals]],
    RPC_URL
  );
}

export async function odooSearch({
  model,
  domain = [],
  uid,
  pass,
  limit = 80,
}: {
  model: string;
  domain?: any[];
  uid: number;
  pass: string;
  limit?: number;
}) {
  return rpcCall(
    "object",
    "execute_kw",
    [DB, uid, pass, model, "search", [domain], { limit }],
    RPC_URL
  );
}
