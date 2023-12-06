const { Schema, model, Types } = require('mongoose');
const Logger = require('../../helpers/logger');

const MAX_PROPOSAL_TITLE = 72;

const LilNounsProposalSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      proposalId: {
         type: Number,
         required: true,
         index: { unique: true },
      },
      proposerId: {
         type: String,
         required: true,
      },
      startBlock: {
         type: Number,
         default: 0,
      },
      endBlock: {
         type: Number,
         default: 0,
      },
      quorumVotes: {
         type: Number,
         default: 0,
      },
      proposalThreshold: {
         type: Number,
         default: 0,
      },
      description: {
         type: String,
         default: '',
      },
      title: {
         type: String,
         required: true,
      },
   },
   {
      statics: {
         /**
          * @param {{
          * 	id: number,
          * 	proposer: {id: string},
          * 	startBlock: number,
          *		endBlock: number,
          *		quorumVotes: number,
          *		proposalThreshold: number,
          *		description: string
          * }} data
          * @returns
          */
         async tryCreateProposal(data) {
            let proposal = await this.findOne({ proposalId: data.id }).exec();
            if (proposal) {
               return proposal;
            }

            const titleEndIndex = data.description.indexOf('\n');
            const title = data.description.substring(1, titleEndIndex).trim(); // Title is formatted as '# Title \n'
            const description = data.description
               .substring(titleEndIndex + 1)
               .trim();

            proposal = await this.create({
               _id: new Types.ObjectId(),
               proposalId: data.id,
               proposerId: data.proposer.id,
               startBlock: data.startBlock,
               endBlock: data.endBlock,
               quorumVotes: data.quorumVotes,
               proposalThreshold: data.proposalThreshold,
               title: title,
               description: description,
            });
            return proposal;
         },

         /**
          * @param {number} proposalId
          * @returns {Promise<string>}
          */
         async fetchProposalTitle(proposalId) {
            let title = `Proposal ${proposalId}`;

            try {
               const proposal = await this.findOne({
                  proposalId: proposalId,
               }).exec();

               if (proposal) {
                  title = proposal.fullTitle;
               }
            } catch (error) {
               Logger.error(
                  'db/schemas/LilNounsProposal.js: Unable to find proposal title.',
                  {
                     proposalId,
                  },
               );
            }

            if (title.length >= MAX_PROPOSAL_TITLE) {
               title = title.substring(0, MAX_PROPOSAL_TITLE).trim() + '...';
            }

            return title;
         },
      },
      virtuals: {
         fullTitle: {
            get() {
               return `Proposal ${this.proposalId}: ${this.title}`;
            },
         },
      },
   },
);

module.exports = model('LilNounsProposal', LilNounsProposalSchema);
