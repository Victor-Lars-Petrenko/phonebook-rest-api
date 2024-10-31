import HttpError from "../helpers/HttpError.js";

import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from "../schemas/contactsSchemas.js";

import {
  addContact,
  getContactByFilter,
  listContacts,
  removeContact,
  modifyContact,
  modifyStatusContact,
  countContacts,
} from "../services/contactsServices.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favourite } = req.query;
    const skip = (page - 1) * limit;
    const filter = Boolean(favourite) ? { owner, favourite } : { owner };
    const allContacts = await listContacts(filter, { skip, limit });
    const total = await countContacts(filter);
    res.status(200).json({ allContacts, total });
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { id } = req.params;
    const oneContact = await getContactByFilter({ owner, _id: id });
    if (!oneContact) {
      throw HttpError(404);
    }
    res.status(200).json(oneContact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { id } = req.params;
    const deletedContact = await removeContact({ owner, _id: id });
    if (!deletedContact) {
      throw HttpError(404);
    }
    res.status(200).json(deletedContact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;
    const newContact = await addContact({ ...req.body, owner });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, "Body must have at least one field");
    }
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;
    const { id } = req.params;
    const updatedContact = await modifyContact({ owner, _id: id }, req.body);
    if (!updatedContact) {
      throw HttpError(404);
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { error } = updateStatusContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;
    const { id } = req.params;
    const updatedContact = await modifyStatusContact(
      { owner, _id: id },
      req.body
    );
    if (!updatedContact) {
      throw HttpError(404);
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
