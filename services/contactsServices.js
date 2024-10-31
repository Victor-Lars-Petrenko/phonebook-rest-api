import { Contact } from "../models/Contact.js";

export const listContacts = (filter = {}, setting = {}) =>
  Contact.find(filter, "-updatedAt -createdAt", setting);

export const countContacts = (filter) => Contact.countDocuments(filter);

export const getContactByFilter = (filter = {}) => Contact.findOne(filter);

export const removeContact = (filter = {}) => Contact.findOneAndDelete(filter);

export const addContact = (contactInfo) => Contact.create(contactInfo);

export const modifyContact = (filter = {}, contactNewInfo) =>
  Contact.findOneAndUpdate(filter, contactNewInfo);

export const modifyStatusContact = (filter = {}, newStatus) =>
  Contact.findOneAndUpdate(filter, newStatus);
