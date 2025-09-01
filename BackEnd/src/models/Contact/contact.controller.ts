import { prisma } from "../../../prisma/client";
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/response";
import { CreateContact, UpdateContact } from "./contact.types";

export const getContacts = async (_: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: { faq: true },
    });
    return successResponse(res, contacts, "Contacts fetched");
  } catch (error) {
    return errorResponse(res, error, "Failed to fetch contacts");
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const data: CreateContact[] = req.body;
    const contact = await prisma.contact.createMany({
      data,
    });
    return successResponse(res, contact, "Contact created");
  } catch (error) {
    return errorResponse(res, error, "Failed to create contact");
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const data: UpdateContact = req.body;
    const contact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data,
    });
    return successResponse(res, contact, "Contact updated");
  } catch (error) {
    return errorResponse(res, error, "Failed to update contact");
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    await prisma.contact.delete({ where: { id: Number(req.params.id) } });
    return successResponse(res, null, "Contact deleted");
  } catch (error) {
    return errorResponse(res, error, "Failed to delete contact");
  }
};
