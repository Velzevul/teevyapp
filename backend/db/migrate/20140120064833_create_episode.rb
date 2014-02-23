class CreateEpisode < ActiveRecord::Migration
  def change
    create_table :episodes do |t|
      t.integer    :episode_index
      t.string     :title
      t.integer    :episode_number
      t.integer    :season_number
      t.datetime   :aired_at
      t.references :show, index: true
    end
  end
end
