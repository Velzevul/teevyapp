class Episode < ActiveRecord::Base
  validates :title, :episode_number, :season_number, :aired_at, :episode_index, :presence => true

  default_scope { order("episode_index ASC") }
  scope :aired,  lambda { where("aired_at <= ?", DateTime.now).order("episode_index ASC") }

  belongs_to :show
end
