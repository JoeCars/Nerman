const { Schema, model, Types } = require('mongoose');

const ProposalSchema = new Schema(
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
            const proposal = await this.findOne({
               proposalId: proposalId,
            }).exec();

            if (proposal) {
               return proposal.fullTitle;
            } else {
               return `Proposal ${proposalId}`;
            }
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

module.exports = model('Proposal', ProposalSchema);
