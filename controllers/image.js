const handleImage = (postgresDB) => (req, res) => {
    const {
        id
    } = req.body;

    postgresDB("users")
        .where("id", "=", id)
        .increment("entries", 1)
        .returning("entries")
        .then(entries => {
            res.json(entries[0]);
            console.log('image loaded');

        })
        .catch(err => res.status(400).json("unable to get entries"));
};

module.exports = {
    handleImage: handleImage,
}