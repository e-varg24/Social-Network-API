const { Thought, User } = require('../models');

module.exports = {
    // Gets all thoughts
    getThoughts (req, res) {
        Thought.find()
            .then((thoughts) => {
                return res.json(thoughts);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
    // Gets single thought by id
    getSingleThought (req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
            .select('-__v')
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'cant find thought with this id' })
                    : res.json(thought)
            )
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
    // Creates new thought
    createThought (req, res) {
        Thought.create(req.body)
            .then((thought) => {
                return User.findOneAndUpdate(
                    { _id: req.body.userId },
                    { $push: { thoughts: thought._id } },
                    { new: true }
                );
            })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: "Thought has been created but no user with this id found" })
                    : res.json({
                        updatedUser: user,
                        message: 'Thought added to user'
                    })
            )
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
    // Update thought by id
    updateThought (req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'cant find thought with this id' })
                    : res.json({
                        updatedThought: thought,
                        message: 'Thought updated'
                    })
            )
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
    // Delete a thought by id
    deleteThought (req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'cant find thought with this id' })
                    : User.findOneAndUpdate(
                        { thoughts: req.params.thoughtId },
                        { $pull: { thoughts: { thoughtId: req.params.thoughtId } } },
                        { runValidators: true, new: true }
                    )
            )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user with this deleted thought found' })
                    : res.json({
                        updatedUser: user,
                        message: 'Thought deleted and removed from user'
                    }))
            .catch((err) => res.status(500).json(err));
    },
    // Creates reaction
    createReaction (req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'cant find thought with this id' })
                    : res.json({
                        updatedThought: thought,
                        message: 'Reaction created and added to thought' })
            )
            .catch((err) => {
                return res.status(500).json(err)
            });
    },
    // Removes reaction
    removeReaction (req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'cant find thought with this id' })
                    : res.json({
                        updatedThought: thought,
                        message: 'Reaction deleted and removed from thought'
                    })
            )
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
};