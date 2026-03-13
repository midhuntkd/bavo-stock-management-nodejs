import mongoose, { Schema } from 'mongoose';

interface ICounterDoc extends mongoose.Document {
  key: string;
  seq: number;
}

const counterSchema = new Schema<ICounterDoc>(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Counter = mongoose.models.Counter || mongoose.model<ICounterDoc>('Counter', counterSchema);

export const generateRunningNumber = async (prefix: string, sequenceKey: string) => {
  const counter = await Counter.findOneAndUpdate(
    { key: sequenceKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${datePart}-${String(counter.seq).padStart(6, '0')}`;
};
